import mongoose,{Schema} from "mongoose";
const analyticsSchema = new mongoose.Schema(
  {
    url: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Url",
      required: true,
      index: true,
    },

    clickedByIp: {
      type: String,
    },

    userAgent: {
      type: String,
    },

    referrer: {
      type: String,
      default: "Direct",
    },

    browser: {
      type: String,
    },

    os: {
      type: String,
    },

    device: {
      type: String,
      default:"Desktop"
    },

    country: {
      type: String,
      default:"Unknown"
    },

    city: {
      type: String,
      default:"Unknowm"
    },
  },
  {
    timestamps: true,
  }
);

export const Analytics = mongoose.model("Analytics", analyticsSchema);