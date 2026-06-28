import { Analytics } from "../models/analytics.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Url } from "../models/url.models.js";

const getUrlAnalytics = asyncHandler(async (req, res) => {
  //testing
  // console.log(req.query);
  // console.log(req.params);
  // console.log(req.query.page)

  const { shortCode } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const url = await Url.findOne({
    shortCode,
    createdBy: req.user?._id,
  });
  if (!url) {
    throw new ApiError(404, "URL not found");
  }
  const analytics = await Url.aggregate([
    {
      $match: {
        shortCode,
        createdBy: req.user?._id,
      },
    },

    {
      $lookup: {
        from: "analytics",
        localField: "_id",
        foreignField: "url",
        as: "analytics",

        pipeline: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
      },
    },
    {
      $lookup: {
        from: "analytics",
        localField: "_id",
        foreignField: "url",
        as: "allAnalytics",
      },
    },
    {
      $addFields: {
        totalAnalytics: {
          $size: "$allAnalytics",
        },
        totalPages: {
          $ceil: {
            $divide: [{ $size: "$allAnalytics" }, limit],
          },
        },
      },
    },
    {
      $project: {
        shortCode: 1,
        originalUrl: 1,
        totalClicks: "$clicks",
        totalAnalytics: 1,
        totalPages: 1,
        analytics: 1,
      },
    },
  ]);

  return res
  .status(200)
  .json(new ApiResponse(200,analytics[0],"Anlytics fetches successfully"))
});

export { getUrlAnalytics };
