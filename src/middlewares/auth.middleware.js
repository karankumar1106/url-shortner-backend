import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt, { decode } from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!accessToken) {
      throw new ApiError(401, "Access token is missing");
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken.user_id).select(
      "-password -refreshToken",
    );
    if (!user) {
      throw new ApiError(404, "user not found");
    }
    req.user = user;
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid access token");
  }
});

