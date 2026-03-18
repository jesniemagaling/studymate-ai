export type ApiSuccess<T extends Record<string, unknown>> = {
  success: true;
  message: string;
  data: T;
} & T;

export type ApiFailure = {
  success: false;
  message: string;
  errorCode?: string;
  error?: string;
  details?: unknown;
};

export async function apiFetch<T extends Record<string, unknown>>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<ApiSuccess<T>> {
  const res = await fetch(input, init);
  const payload = await res.json().catch(() => ({}));

  if (!res.ok || payload?.success === false) {
    const message =
      String(payload?.message || payload?.error || "Request failed") ||
      "Request failed";
    throw new Error(message);
  }

  if (payload?.success === true && payload?.data) {
    return payload as ApiSuccess<T>;
  }

  // Backward-compatible fallback for endpoints not yet fully migrated.
  return {
    success: true,
    message: String(payload?.message || "OK"),
    data: payload as T,
    ...(payload as T),
  };
}
