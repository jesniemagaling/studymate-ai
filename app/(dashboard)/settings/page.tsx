"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Activity, Cpu, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleCard, ModulePage } from "@/components/layout/ModuleShell";

type ProviderMode = "deterministic" | "local-first" | "openai";
type OutcomeMode = "best-quality" | "fastest-response" | "offline-local";

type PipelineSettings = {
  providerMode: ProviderMode;
  enableLocalProvider: boolean;
  allowPaidProviders: boolean;
  enableOpenAIAdapter: boolean;
};

type AuditEntry = {
  id: string;
  updatedAt: string;
  updatedByUserId: string;
  updatedByLabel: string;
  previous: PipelineSettings;
  next: PipelineSettings;
};

type HealthPayload = {
  providerMode: ProviderMode;
  localProvider: {
    enabled: boolean;
    baseUrl: string;
    model: string;
    available: boolean;
    latencyMs: number | null;
    status: number | null;
    error: string | null;
  };
  paidProviders: {
    enabled: boolean;
    openAIAdapterEnabled: boolean;
    lockedByEnv: boolean;
  };
};

const outcomeDescriptions: Record<OutcomeMode, string> = {
  "best-quality":
    "Prioritizes richer outputs. May use premium provider when unlocked.",
  "fastest-response":
    "Uses stable deterministic generation for consistent speed.",
  "offline-local":
    "Local mode runs on this machine and may be slower but has no cloud usage.",
};

export default function SettingsPage() {
  const HEALTH_REFRESH_MS = 12000;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [healthRefreshing, setHealthRefreshing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [paidControlsLockedByEnv, setPaidControlsLockedByEnv] = useState(true);
  const [showPaidControls, setShowPaidControls] = useState(false);
  const [settings, setSettings] = useState<PipelineSettings>({
    providerMode: "deterministic",
    enableLocalProvider: false,
    allowPaidProviders: false,
    enableOpenAIAdapter: false,
  });
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  const fetchHealth = useCallback(async (showToastOnError = false) => {
    setHealthRefreshing(true);

    try {
      const healthRes = await fetch("/api/ai/health", {
        method: "GET",
        credentials: "include",
      });
      const healthData = await healthRes.json().catch(() => ({}));

      if (!healthRes.ok || healthData?.success === false) {
        throw new Error(healthData?.message || "Failed to fetch health");
      }

      setHealth(healthData?.health || null);
    } catch (error) {
      if (showToastOnError) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load local provider health";
        toast.error(message);
      }
    } finally {
      setHealthRefreshing(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    const settingsRes = await fetch("/api/ai/settings", {
      method: "GET",
      credentials: "include",
    });

    const settingsData = await settingsRes.json().catch(() => ({}));

    if (!settingsRes.ok || settingsData?.success === false) {
      throw new Error(settingsData?.message || "Failed to fetch settings");
    }

    const nextCanEdit = Boolean(settingsData?.canEdit);

    setCanEdit(nextCanEdit);
    setPaidControlsLockedByEnv(Boolean(settingsData?.paidControlsLockedByEnv));
    setSettings({
      providerMode: settingsData?.settings?.providerMode || "deterministic",
      enableLocalProvider: Boolean(settingsData?.settings?.enableLocalProvider),
      allowPaidProviders: Boolean(settingsData?.settings?.allowPaidProviders),
      enableOpenAIAdapter: Boolean(settingsData?.settings?.enableOpenAIAdapter),
    });
    setAuditEntries(
      nextCanEdit && Array.isArray(settingsData?.auditEntries)
        ? settingsData.auditEntries
        : [],
    );

    await fetchHealth(true);
  }, [fetchHealth]);

  useEffect(() => {
    const run = async () => {
      try {
        await fetchSettings();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load AI settings dashboard";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [fetchSettings]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const interval = setInterval(() => {
      fetchHealth(false);
    }, HEALTH_REFRESH_MS);

    return () => clearInterval(interval);
  }, [fetchHealth, loading]);

  const localProviderUnreachable =
    Boolean(health?.localProvider.enabled) &&
    !Boolean(health?.localProvider.available);

  const studentStatusLines = useMemo(() => {
    return {
      ready: "AI is ready",
      speed: localProviderUnreachable
        ? "Generation may be slower now"
        : "Generation speed is currently normal",
      fallback:
        settings.providerMode === "deterministic" || localProviderUnreachable
          ? "We are using safe fallback mode"
          : "Primary mode is active with safe fallback available",
    };
  }, [localProviderUnreachable, settings.providerMode]);

  const applyOutcomePreset = (mode: OutcomeMode) => {
    if (mode === "fastest-response") {
      setSettings((prev) => ({
        ...prev,
        providerMode: "deterministic",
        allowPaidProviders: false,
        enableOpenAIAdapter: false,
      }));
      return;
    }

    if (mode === "offline-local") {
      setSettings((prev) => ({
        ...prev,
        providerMode: "local-first",
        enableLocalProvider: true,
        allowPaidProviders: false,
        enableOpenAIAdapter: false,
      }));
      return;
    }

    if (paidControlsLockedByEnv) {
      setSettings((prev) => ({
        ...prev,
        providerMode: prev.enableLocalProvider
          ? "local-first"
          : "deterministic",
        allowPaidProviders: false,
        enableOpenAIAdapter: false,
      }));
      return;
    }

    setSettings((prev) => ({
      ...prev,
      providerMode: "openai",
      enableLocalProvider: true,
      allowPaidProviders: true,
      enableOpenAIAdapter: true,
    }));
  };

  const handleSave = async () => {
    if (!canEdit) {
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/ai/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to save settings");
      }

      await fetchSettings();
      toast.success("AI runtime settings updated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update settings";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModulePage
      className="max-w-5xl space-y-4 sm:space-y-6"
      aria-label="AI settings"
    >
      {!canEdit && !loading ? (
        <ModuleCard>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Status
            </CardTitle>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Study mode keeps AI reliable and safe while you focus on learning.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pb-2 text-[15px] leading-6">
            <p className="font-medium text-foreground">
              {studentStatusLines.ready}
            </p>
            <p className="text-foreground">{studentStatusLines.speed}</p>
            <p className="text-foreground">{studentStatusLines.fallback}</p>
          </CardContent>
        </ModuleCard>
      ) : null}

      {canEdit ? (
        <ModuleCard>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <ShieldCheck className="h-5 w-5 text-primary" />
              AI Provider Controls
            </CardTitle>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Use outcome-based controls first. Open advanced mapping only when
              technical tuning is needed.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {localProviderUnreachable ? (
              <div className="rounded-lg border border-amber-400/60 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                Local provider is enabled but currently unreachable. Generation
                will fall back to deterministic mode until local AI is
                available.
              </div>
            ) : null}

            <div className="grid gap-3">
              <p className="text-sm font-medium">Study Experience Presets</p>

              <button
                type="button"
                onClick={() => applyOutcomePreset("best-quality")}
                className="rounded-xl border border-border/60 px-4 py-3.5 text-left transition hover:border-primary/40 hover:bg-muted/50"
                disabled={saving}
              >
                <p className="text-sm font-medium">Best quality</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {outcomeDescriptions["best-quality"]}
                </p>
              </button>

              <button
                type="button"
                onClick={() => applyOutcomePreset("fastest-response")}
                className="rounded-xl border border-border/60 px-4 py-3.5 text-left transition hover:border-primary/40 hover:bg-muted/50"
                disabled={saving}
              >
                <p className="text-sm font-medium">Fastest response</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {outcomeDescriptions["fastest-response"]}
                </p>
              </button>

              <button
                type="button"
                onClick={() => applyOutcomePreset("offline-local")}
                className="rounded-xl border border-border/60 px-4 py-3.5 text-left transition hover:border-primary/40 hover:bg-muted/50"
                disabled={saving}
              >
                <p className="text-sm font-medium">Offline/local mode</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {outcomeDescriptions["offline-local"]}
                </p>
              </button>
            </div>

            <details className="rounded-xl border border-border/60 p-3.5">
              <summary className="cursor-pointer text-sm font-medium leading-6">
                Advanced technical mapping
              </summary>

              <div className="mt-3 space-y-4">
                <div className="grid gap-2">
                  <p className="text-sm font-medium">Provider Mode</p>
                  {(
                    ["deterministic", "local-first", "openai"] as ProviderMode[]
                  ).map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      variant={
                        settings.providerMode === mode ? "default" : "outline"
                      }
                      className="justify-start"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, providerMode: mode }))
                      }
                      disabled={saving}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>

                <label className="flex items-center gap-3 rounded-lg border p-3">
                  <input
                    type="checkbox"
                    checked={settings.enableLocalProvider}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        enableLocalProvider: e.target.checked,
                      }))
                    }
                    disabled={saving}
                  />
                  <span className="text-sm">
                    Enable local provider (runs on this machine)
                  </span>
                </label>

                {paidControlsLockedByEnv ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Paid-provider controls are locked by environment safety
                    policy.
                  </p>
                ) : !showPaidControls ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPaidControls(true)}
                    disabled={saving}
                  >
                    Unlock paid-provider controls
                  </Button>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex items-center gap-3 rounded-lg border p-3">
                      <input
                        type="checkbox"
                        checked={settings.allowPaidProviders}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            allowPaidProviders: e.target.checked,
                          }))
                        }
                        disabled={saving}
                      />
                      <span className="text-sm">Allow paid providers</span>
                    </label>

                    <label className="flex items-center gap-3 rounded-lg border p-3">
                      <input
                        type="checkbox"
                        checked={settings.enableOpenAIAdapter}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            enableOpenAIAdapter: e.target.checked,
                          }))
                        }
                        disabled={saving}
                      />
                      <span className="text-sm">Enable OpenAI adapter</span>
                    </label>
                  </div>
                )}
              </div>
            </details>

            <Button
              onClick={handleSave}
              disabled={loading || saving}
              className="h-10 px-5"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Runtime Settings"}
            </Button>
          </CardContent>
        </ModuleCard>
      ) : null}

      <ModuleCard>
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Activity className="h-5 w-5 text-primary" />
            AI Service Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6">
          {loading ? (
            <p className="text-muted-foreground">Checking provider health...</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span>
                  AI status:{" "}
                  {health?.localProvider.available ? "Ready" : "Stable"}
                </span>
              </div>

              {!canEdit ? (
                <>
                  <p className="text-muted-foreground">
                    {health?.localProvider.available
                      ? "Your AI study tools are running normally."
                      : "AI features are still available through safe mode while advanced local AI is unavailable."}
                  </p>
                  <p className="text-muted-foreground">
                    {healthRefreshing
                      ? "Refreshing status..."
                      : "Status checks are updated automatically."}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    Local AI status:{" "}
                    {health?.localProvider.available
                      ? "Available"
                      : "Unavailable"}
                  </p>
                  <p className="text-muted-foreground">
                    Base URL: {health?.localProvider.baseUrl || "-"}
                  </p>
                  <p className="text-muted-foreground">
                    Model: {health?.localProvider.model || "-"}
                  </p>
                  <p className="text-muted-foreground">
                    Latency: {health?.localProvider.latencyMs ?? "-"} ms
                  </p>
                  <p className="text-muted-foreground">
                    Refresh:{" "}
                    {healthRefreshing ? "Updating..." : "Live every 12s"}
                  </p>
                  {health?.localProvider.error ? (
                    <p className="text-amber-600 dark:text-amber-400">
                      Detail: {health.localProvider.error}
                    </p>
                  ) : null}
                </>
              )}
            </>
          )}
        </CardContent>
      </ModuleCard>

      {canEdit ? (
        <ModuleCard>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Recent Setting Changes
            </CardTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Operational audit history for configuration updates.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {auditEntries.length === 0 ? (
              <p className="text-muted-foreground">
                No recent setting changes recorded.
              </p>
            ) : (
              <div className="space-y-2">
                {auditEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-border/60 p-3.5"
                  >
                    <p className="font-medium">
                      {entry.updatedByLabel} at{" "}
                      {new Date(entry.updatedAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Mode: {entry.previous.providerMode} to{" "}
                      {entry.next.providerMode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </ModuleCard>
      ) : null}
    </ModulePage>
  );
}
