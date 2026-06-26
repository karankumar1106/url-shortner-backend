import { Url } from "../models/url.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateShortCode } from "../utils/generateShortCode.js";
import { isValidUrl } from "../utils/isValidUrl.js";

const createShortUrl = asyncHandler(async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    throw new ApiError(400, "original Url is required");
  }

  if (!isValidUrl(originalUrl)) {
    throw new ApiError(400, "Invalid URL format");
  }

  const shortCode = generateShortCode();
  const url = await Url.create({
    originalUrl,
    shortCode,
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

  const url = await Url.findOneAndUpdate(
    { shortCode, isActive: true },
    {
      $inc: {
        clicks: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );
  if (!url) {
    throw new ApiError(404, "short url no found or inactive");
  }
  return res.redirect(url.originalUrl);
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

  if (!user) {
    throw new ApiError(404, "No url for this owner");
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

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Url deleted successfully"));
});
export {
  createShortUrl,
  redirectToOriginalUrl,
  getUrlStats,
  getMyUrls,
  deactivateUrl,
};
