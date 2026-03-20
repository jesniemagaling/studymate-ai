import { getEffectiveAIPipelineConfig } from "@/lib/ai/runtime-settings";

async function pingLocalProvider(options: {
  baseUrl: string;
  timeoutMs: number;
}) {
  const controller = new AbortController();
  const started = Date.now();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(`${options.baseUrl}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });

    return {
      available: response.ok,
      latencyMs: Date.now() - started,
      status: response.status,
      error: response.ok ? null : `LOCAL_HTTP_${response.status}`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "LOCAL_PROVIDER_UNREACHABLE";

    return {
      available: false,
      latencyMs: Date.now() - started,
      status: null,
      error: message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLocalProviderHealth() {
  const { effectiveConfig, paidControlsLockedByEnv } =
    await getEffectiveAIPipelineConfig();

  const localStatus = effectiveConfig.enableLocalProvider
    ? await pingLocalProvider({
        baseUrl: effectiveConfig.localBaseUrl,
        timeoutMs: Math.min(5000, effectiveConfig.localTimeoutMs),
      })
    : {
        available: false,
        latencyMs: null,
        status: null,
        error: "LOCAL_PROVIDER_DISABLED",
      };

  return {
    providerMode: effectiveConfig.providerMode,
    localProvider: {
      enabled: effectiveConfig.enableLocalProvider,
      baseUrl: effectiveConfig.localBaseUrl,
      model: effectiveConfig.localModel,
      ...localStatus,
    },
    paidProviders: {
      enabled: effectiveConfig.allowPaidProviders,
      openAIAdapterEnabled: effectiveConfig.enableOpenAIAdapter,
      lockedByEnv: paidControlsLockedByEnv,
    },
  };
}
