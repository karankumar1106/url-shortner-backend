import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;
  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exist");
  }

  const profileImageLocalPath = req.file?.path;
  const profileImage = profileImageLocalPath
    ? await uploadOnCloudinary(
        profileImageLocalPath,
        "url-shortener/profile-images",
      )
    : null;

  const user = await User.create({
    userName: userName,
    email,
    fullName,
    password,
    profileImage: profileImage.secure_url,
    profileImagePublicId: profileImage.public_id,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  // if deleted after creation
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  if (!email && !userName) {
    throw new ApiError(400, "Email or username is required");
  }
  if (!password) {
    throw new ApiError(400, "password is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user not found");
  }
  //testing
  console.log(password);
  console.log(user);
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({
    validateBeforeSave: false,
  });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      returnDocument: "after",
      validateBeforeSave: false,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user loged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "user is not authenticated");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current user retrieved successfully"),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Refresh token is missing");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  const user = await User.findById(decodedToken?.userId);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid or Refresh token does not match");
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
        },
        "Access token refreshed successfully",
      ),
    );
});

const updateprofileImage = asyncHandler(async (req, res) => {
  const profileImageLocalPath = req.file.path;
  if (!profileImageLocalPath) {
    throw new ApiError(400, "profileImage file is requierd");
  }
  const profileImage = await uploadOnCloudinary(
    profileImageLocalPath,
    "url-shortener/profile-images",
  );
  const userToUpdate = await User.findById(req.user._id);
  if (!userToUpdate) {
    throw new ApiError(404, "User not found");
  }

  if (userToUpdate.profileImagePublicId) {
    await destroyOnCloudinary(userToUpdate.profileImagePublicId);
  }

  const updateduser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        profileImage: profileImage.secure_url,
        profileImagePublicId: profileImage.public_id,
      },
    },
    {
      returnDocument: "after",
    },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateduser, "profile image updated successfully"),
    );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;

  if (!email && !fullName) {
    throw new ApiError(400, "Provide at least one field to update");
  }

  if (email) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id }, // Exclude the current user
    });

    if (existingUser) {
      throw new ApiError(409, "Email already exists");
    }
  }

  const updateFields = {};

  if (email) {
    updateFields.email = email;
  }

  if (fullName) {
    updateFields.fullName = fullName;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updateFields,
    },
    {
      returnDocument: "after",
    },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save({
    validateBeforeSave: false,
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  updateprofileImage,
  updateProfile,
  changeCurrentPassword
};
