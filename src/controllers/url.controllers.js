import { Url } from "../models/url.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateShortCode } from "../utils/generateShortCode.js";

const createShortUrl = asyncHandler(async (req, res) => {
  const { originalUrl } = req.body;
  
  if (!originalUrl) {
    throw new ApiError(400, "original Url is required");
  }

  const shortCode = generateShortCode();
  const url = await Url.create({
    originalUrl,
    shortCode,
  });

  const shorturl = `${req.protocol}://${req.headers.host}/${shortCode}`;
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { originalUrl: url.originalUrl, shortCode: url.shortCode, shorturl },
        "Short Url created successfully",
      ),
    );
});

const redirectToOriginalUrl = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const url = await Url.findOneAndUpdate(
    { shortCode },
    {
      $inc: {
        clicks: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );
  if(!url){
    throw new ApiError(404,"short url no found")
  }
  return res.redirect(url.originalUrl);
});
export { createShortUrl, redirectToOriginalUrl };
