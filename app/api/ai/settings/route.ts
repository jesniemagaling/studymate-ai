import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveAiSettingsAccess } from "@/lib/auth/admin-access";
import {
  getEffectiveAIPipelineConfig,
  getRecentAiSettingsAuditEntries,
  saveAIPipelineSettings,
  type RuntimeAIPipelineSettings,
} from "@/lib/ai/runtime-settings";

const payloadSchema = z.object({
  providerMode: z.enum(["deterministic", "local-first", "openai"]),
  enableLocalProvider: z.boolean(),
  allowPaidProviders: z.boolean(),
  enableOpenAIAdapter: z.boolean(),
});

export async function GET(req: NextRequest) {
  const access = await resolveAiSettingsAccess(req);

  if (!access.userId) {
    return apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  const config = await getEffectiveAIPipelineConfig();
  const auditEntries = access.isAllowed
    ? await getRecentAiSettingsAuditEntries(12)
    : [];

  return apiSuccess(
    {
      canEdit: access.isAllowed,
      settings: {
        ...config.effectiveConfig,
      },
      storedSettings: config.storedSettings,
      paidControlsLockedByEnv: config.paidControlsLockedByEnv,
      auditEntries,
    },
    "AI settings fetched",
  );
}

export async function PUT(req: NextRequest) {
  const access = await resolveAiSettingsAccess(req);

  if (!access.userId) {
    return apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  if (!access.isAllowed) {
    return apiError({
      message: "Forbidden",
      status: 403,
      errorCode: "FORBIDDEN",
    });
  }

  try {
    const payload = payloadSchema.parse(await req.json());
    const config = await getEffectiveAIPipelineConfig();

    const nextSettings: RuntimeAIPipelineSettings = {
      providerMode: payload.providerMode,
      enableLocalProvider: payload.enableLocalProvider,
      allowPaidProviders: config.paidControlsLockedByEnv
        ? false
        : payload.allowPaidProviders,
      enableOpenAIAdapter: config.paidControlsLockedByEnv
        ? false
        : payload.enableOpenAIAdapter,
    };

    await saveAIPipelineSettings({
      settings: nextSettings,
      updatedByUserId: access.userId,
    });

    const refreshed = await getEffectiveAIPipelineConfig();

    return apiSuccess(
      {
        settings: refreshed.effectiveConfig,
        storedSettings: refreshed.storedSettings,
        paidControlsLockedByEnv: refreshed.paidControlsLockedByEnv,
      },
      "AI settings updated",
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError({
        message: "Invalid AI settings payload",
        status: 400,
        errorCode: "INVALID_AI_SETTINGS_PAYLOAD",
        details: error.flatten(),
      });
    }

    console.error("AI settings update error:", error);
    return apiError({
      message: "Failed to update AI settings",
      status: 500,
      errorCode: "AI_SETTINGS_UPDATE_FAILED",
    });
  }
}
