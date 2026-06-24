import mongoose, { Schema } from "mongoose";
import { nanoid } from "nanoid";
const urlSchema = new Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      default: () => {
        nanoid(6);
      },
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Url=mongoose.model("Url",urlSchema)