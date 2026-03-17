import mongoose, { Schema, models } from "mongoose";

const ResultSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["reviewer", "quiz", "flashcards"],
      required: true,
    },

    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default models.Result || mongoose.model("Result", ResultSchema);
