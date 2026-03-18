import mongoose, { Schema, models } from "mongoose";

const PdfSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
    },
    extractionStatus: {
      type: String,
      enum: ["success", "fallback", "failed"],
      default: "success",
      required: true,
    },
    extractionError: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default models.Pdf || mongoose.model("Pdf", PdfSchema);
