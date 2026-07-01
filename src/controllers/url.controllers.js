import { Url } from "../models/url.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateShortCode } from "../utils/generateShortCode.js";
import { isValidUrl } from "../utils/isValidUrl.js";
import { isValidCustomCode } from "../utils/isValidCustomCode.js";

import { Analytics } from "../models/analytics.models.js";
import { UAParser } from "ua-parser-js";

import redisClient from "../config/redis.js";

const createShortUrl = asyncHandler(async (req, res) => {
  const { originalUrl, customCode, expiresAt } = req.body;

  if (!originalUrl) {
    throw new ApiError(400, "original Url is required");
  }

  if (!isValidUrl(originalUrl)) {
    throw new ApiError(400, "Invalid URL format");
  }

  let shortCode;
  let isCustomAlias = false;
  if (customCode) {
    if (!isValidCustomCode(customCode)) {
      throw new ApiError(
        400,
        "Custom alias must be 3-30 characters and can contain letters, numbers, _ or -",
      );
    }
    const existingCode = await Url.findOne({ shortCode: customCode });
    if (existingCode) {
      throw new ApiError(409, "Custom alias already exist");
    }
    shortCode = customCode;
    isCustomAlias = true;
  } else {
    shortCode = generateShortCode();
  }


  let expiryDate = null;
  if (expiresAt) {
    expiryDate = new Date(expiresAt); // string to Date object
    if (isNaN(expiryDate.getTime())) {
      throw new ApiError(400, "Invalid expiry date");
    }
    if (expiryDate <= new Date()) {
      throw new ApiError(400, "Expiry date must be in the future");
    }
  }

  const url = await Url.create({
    originalUrl,
    shortCode,
    customAlias: isCustomAlias,
    expiresAt: expiryDate,
    createdBy: req.user._id,
  });

  const shortUrl = `${req.protocol}://${req.headers.host}/${shortCode}`;
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { originalUrl: url.originalUrl, shortCode: url.shortCode, shortUrl },
        "Short Url created successfully",
      ),
    );
});

const redirectToOriginalUrl = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const cachedUrl = await redisClient.get(`url:${shortCode}`);

  // Check Redis before querying MongoDB (Cache-Aside Pattern)
  if (cachedUrl) {
    const urlData = JSON.parse(cachedUrl);
    if (urlData.expiresAt && new Date(urlData.expiresAt) <= new Date()) {
      throw new ApiError(410, "Short URL has expired");
    }

    await Url.updateOne({ shortCode }, { $inc: { clicks: 1 } });

    const userAgent = req.get("User-Agent");
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();
    await Analytics.create({
      url: urlData._id,
      clickedByIp: req.ip,
      userAgent,
      referrer: req.get("Referer"),
      browser: uaResult.browser.name,
      os: uaResult.os.name,
      device: uaResult.device.type,
    });
    console.log("Redirecting to original URL:", urlData.originalUrl);
    return res.redirect(302, urlData.originalUrl);
  } else {
    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      throw new ApiError(404, "short url no found or inactive");
    }

    if (url.expiresAt && url.expiresAt <= new Date()) {
      throw new ApiError(410, "Short URL has expired");
    }

    // stringify the url object and store it in redis with an expiration time
    const result = await redisClient.set(
      `url:${shortCode}`,
      JSON.stringify({
        _id: url._id,
        originalUrl: url.originalUrl,
        expiresAt: url.expiresAt,
      }),
      {
        EX: 60 * 60, // cache for a hour
      },
    );

    await Url.updateOne({ shortCode }, { $inc: { clicks: 1 } });


    const userAgent = req.get("User-Agent");
    const parser = new UAParser(userAgent);

    const uaResult = parser.getResult();

    await Analytics.create({
      url: url._id,
      clickedByIp: req.ip,
      userAgent,
      referrer: req.get("Referer"),
      browser: uaResult.browser.name,
      os: uaResult.os.name,
      device: uaResult.device.type,
    });
    return res.redirect(302, url.originalUrl);
  }
});

const getUrlStats = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;
  const url = await Url.findOne({ shortCode, createdBy: req.user._id });
  if (!url) {
    throw new ApiError(404, "Url not found or inactive");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${req.protocol}://${req.host}/${url.shortCode}`,
        clicks: url.clicks,
        isActive: url.isActive,
        createdBy: url.createdBy,
        customAlias: url.customAlias,
        expiresAt: url.expiresAt,
        isExpired: url.expiresAt ? url.expiresAt <= new Date() : false,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
      },
      "Url stats fetched successfully",
    ),
  );
});

const getMyUrls = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const urls = await Url.find({
    createdBy: req.user?._id,
  }).sort({ createdAt: -1 });

  if (!urls.length) {
    throw new ApiError(404, "No urls for this owner");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, urls, "All urls fetched successfully"));
});

const deactivateUrl = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;
  const url = await Url.findOne({
    shortCode,
    createdBy: req.user._id,
  });
  if (!url) {
    throw new ApiError(404, "Url not found");
  }
  if (!url.isActive) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Url is already deactivated"));
  }

  url.isActive = false;
  await url.save();

  // deleting from redis cache if exists, so that next time it will not be redirected
  await redisClient.del(`url:${shortCode}`);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Url deactivated successfully"));
});
export {
  createShortUrl,
  redirectToOriginalUrl,
  getUrlStats,
  getMyUrls,
  deactivateUrl,
};
