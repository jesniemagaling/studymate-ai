import mongoose, { Schema, models } from "mongoose";

const AnalyticsSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["quiz_attempt"],
      required: true,
      index: true,
    },
    resultId: {
      type: String,
      required: false,
      index: true,
    },
    sourcePdfId: {
      type: String,
      required: false,
      index: true,
    },
    score: {
      type: Number,
      required: false,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: false,
      min: 1,
    },
    percentage: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
);

export default models.Analytics || mongoose.model("Analytics", AnalyticsSchema);
