import AiSettings from "@/models/AiSettings";
import AiSettingsAudit from "@/models/AiSettingsAudit";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import {
  getAIPipelineConfig,
  withAIPipelineOverrides,
  type AIPipelineConfig,
  type ProviderMode,
} from "@/lib/ai/config";

export type RuntimeAIPipelineSettings = {
  providerMode: ProviderMode;
  enableLocalProvider: boolean;
  allowPaidProviders: boolean;
  enableOpenAIAdapter: boolean;
};

type RuntimeSettingsDoc = RuntimeAIPipelineSettings & {
  updatedByUserId?: string | null;
};

export type AIPipelineAuditEntry = {
  id: string;
  updatedAt: string;
  updatedByUserId: string;
  updatedByLabel: string;
  previous: RuntimeAIPipelineSettings;
  next: RuntimeAIPipelineSettings;
};

export async function getStoredAIPipelineSettings(): Promise<RuntimeAIPipelineSettings | null> {
  try {
    await connectDB();

    const doc = (await AiSettings.findOne({ scope: "global" })
      .select(
        "providerMode enableLocalProvider allowPaidProviders enableOpenAIAdapter",
      )
      .lean()) as RuntimeSettingsDoc | null;

    if (!doc) {
      return null;
    }

    return {
      providerMode: doc.providerMode,
      enableLocalProvider: Boolean(doc.enableLocalProvider),
      allowPaidProviders: Boolean(doc.allowPaidProviders),
      enableOpenAIAdapter: Boolean(doc.enableOpenAIAdapter),
    };
  } catch {
    return null;
  }
}

export async function saveAIPipelineSettings(options: {
  settings: RuntimeAIPipelineSettings;
  updatedByUserId: string;
}) {
  await connectDB();

  const previousDoc = (await AiSettings.findOne({ scope: "global" })
    .select(
      "providerMode enableLocalProvider allowPaidProviders enableOpenAIAdapter",
    )
    .lean()) as RuntimeSettingsDoc | null;

  const previous: RuntimeAIPipelineSettings = previousDoc
    ? {
        providerMode: previousDoc.providerMode,
        enableLocalProvider: Boolean(previousDoc.enableLocalProvider),
        allowPaidProviders: Boolean(previousDoc.allowPaidProviders),
        enableOpenAIAdapter: Boolean(previousDoc.enableOpenAIAdapter),
      }
    : {
        providerMode: "deterministic",
        enableLocalProvider: false,
        allowPaidProviders: false,
        enableOpenAIAdapter: false,
      };

  const updated = await AiSettings.findOneAndUpdate(
    { scope: "global" },
    {
      $set: {
        providerMode: options.settings.providerMode,
        enableLocalProvider: options.settings.enableLocalProvider,
        allowPaidProviders: options.settings.allowPaidProviders,
        enableOpenAIAdapter: options.settings.enableOpenAIAdapter,
        updatedByUserId: options.updatedByUserId,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      lean: true,
    },
  );

  await AiSettingsAudit.create({
    scope: "global",
    updatedByUserId: options.updatedByUserId,
    previous,
    next: options.settings,
  });

  return updated;
}

export async function getRecentAiSettingsAuditEntries(limit = 10) {
  await connectDB();

  const entries = (await AiSettingsAudit.find({ scope: "global" })
    .sort({ createdAt: -1 })
    .limit(Math.max(1, Math.min(50, limit)))
    .lean()) as Array<{
    _id: unknown;
    createdAt?: Date;
    updatedByUserId?: string;
    previous: RuntimeAIPipelineSettings;
    next: RuntimeAIPipelineSettings;
  }>;

  const userIds = Array.from(
    new Set(
      entries
        .map((entry) => String(entry.updatedByUserId || ""))
        .filter(Boolean),
    ),
  );

  const users = (await User.find({ _id: { $in: userIds } })
    .select("firstName lastName email")
    .lean()) as Array<{
    _id: unknown;
    firstName?: string;
    lastName?: string;
    email?: string;
  }>;

  const userLabelMap = new Map(
    users.map((user) => {
      const id = String(user._id);
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const label = fullName || user.email || id;
      return [id, label];
    }),
  );

  return entries.map((entry) => {
    const updatedByUserId = String(entry.updatedByUserId || "unknown");

    return {
      id: String(entry._id),
      updatedAt: new Date(entry.createdAt || Date.now()).toISOString(),
      updatedByUserId,
      updatedByLabel: userLabelMap.get(updatedByUserId) || updatedByUserId,
      previous: entry.previous,
      next: entry.next,
    } satisfies AIPipelineAuditEntry;
  });
}

function applyEnvSafetyCaps(
  envConfig: AIPipelineConfig,
  mergedConfig: AIPipelineConfig,
): AIPipelineConfig {
  const paidLockedByEnv =
    envConfig.allowPaidProviders === false ||
    envConfig.enableOpenAIAdapter === false;

  if (!paidLockedByEnv) {
    return mergedConfig;
  }

  return {
    ...mergedConfig,
    allowPaidProviders: false,
    enableOpenAIAdapter: false,
    providerMode:
      mergedConfig.providerMode === "openai"
        ? mergedConfig.enableLocalProvider
          ? "local-first"
          : "deterministic"
        : mergedConfig.providerMode,
  };
}

export async function getEffectiveAIPipelineConfig() {
  const envConfig = getAIPipelineConfig();
  const stored = await getStoredAIPipelineSettings();
  const merged = withAIPipelineOverrides(envConfig, stored || {});
  const effective = applyEnvSafetyCaps(envConfig, merged);

  return {
    envConfig,
    storedSettings: stored,
    effectiveConfig: effective,
    paidControlsLockedByEnv:
      envConfig.allowPaidProviders === false ||
      envConfig.enableOpenAIAdapter === false,
  };
}
