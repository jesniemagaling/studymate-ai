import mongoose, { Schema, models } from "mongoose";

const EmailVerificationCodeSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
    usedAt: {
      type: Date,
      required: false,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

EmailVerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.EmailVerificationCode ||
  mongoose.model("EmailVerificationCode", EmailVerificationCodeSchema);
