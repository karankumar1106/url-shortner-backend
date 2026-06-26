import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folder = "url-shortener") => {
  try {
    if (!localFilePath) {
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

const destroyOnCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return null;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.log("cloudinary delete fails: ", error);
    throw error;
  }
};

export { uploadOnCloudinary, destroyOnCloudinary };
