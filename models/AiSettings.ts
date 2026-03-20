import mongoose, { Schema, models } from "mongoose";

const AiSettingsSchema = new Schema(
  {
    scope: { type: String, required: true, unique: true, default: "global" },
    providerMode: {
      type: String,
      enum: ["deterministic", "local-first", "openai"],
      default: "deterministic",
    },
    enableLocalProvider: { type: Boolean, default: false },
    allowPaidProviders: { type: Boolean, default: false },
    enableOpenAIAdapter: { type: Boolean, default: false },
    updatedByUserId: { type: String, default: null },
  },
  { timestamps: true },
);

const AiSettings =
  models.AiSettings || mongoose.model("AiSettings", AiSettingsSchema);

export default AiSettings;
