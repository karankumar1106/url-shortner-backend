import mongoose from "mongoose";
import { Url } from "../models/url.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const stats = await Url.aggregate([
    {
      $match: {
        createdBy: userId,
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalUrls: { $sum: 1 },
              totalClicks: { $sum: "$clicks" },
              activeUrls: {
                $sum: {
                  $cond:["$isActive", 1, 0],
                },
              },
              inactiveUrls: {
                $sum: {
                  $cond:["$isActive",0,1],
                },
              },
            },
          },
          {
            $project:{
                _id:0,
                totalUrls:1,
                totalClicks:1,
                activeUrls:1,
                inactiveUrls:1
            }
          }
        ],

        topUrl: [
          { $sort: { clicks: -1 } },
          { $limit: 1 },
          {
            $project: {
                _id:0,
              originalUrl: 1,
              shortCode: 1,
              clicks: 1,
              isActive: 1,
            },
          },
        ],
      },
    },
  ]);

  const summary = stats[0]?.summary[0] || {
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0,
    inactiveUrls: 0,
  };

  const topUrl = stats[0]?.topUrl[0] || null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...summary,
        topUrl,
      },
      "Dashboard stats fetched successfully"
    )
  );
});

export { getDashboardStats };
