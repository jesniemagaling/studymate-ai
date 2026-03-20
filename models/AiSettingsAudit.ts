import mongoose, { Schema, models } from "mongoose";

const AiSettingsAuditSchema = new Schema(
  {
    scope: { type: String, required: true, default: "global" },
    updatedByUserId: { type: String, required: true },
    previous: {
      providerMode: {
        type: String,
        enum: ["deterministic", "local-first", "openai"],
        required: true,
      },
      enableLocalProvider: { type: Boolean, required: true },
      allowPaidProviders: { type: Boolean, required: true },
      enableOpenAIAdapter: { type: Boolean, required: true },
    },
    next: {
      providerMode: {
        type: String,
        enum: ["deterministic", "local-first", "openai"],
        required: true,
      },
      enableLocalProvider: { type: Boolean, required: true },
      allowPaidProviders: { type: Boolean, required: true },
      enableOpenAIAdapter: { type: Boolean, required: true },
    },
  },
  { timestamps: true },
);

const AiSettingsAudit =
  models.AiSettingsAudit ||
  mongoose.model("AiSettingsAudit", AiSettingsAuditSchema);

export default AiSettingsAudit;
