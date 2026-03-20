type TurnstileVerificationResult = {
  success: boolean;
  message?: string;
};

type VerifyTurnstileOptions = {
  token?: string;
  ip?: string | null;
};

type TurnstileApiResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export function isTurnstileEnabled() {
  return (
    String(process.env.TURNSTILE_ENABLED || "false").toLowerCase() === "true"
  );
}

export async function verifyTurnstileToken(
  options: VerifyTurnstileOptions,
): Promise<TurnstileVerificationResult> {
  if (!isTurnstileEnabled()) {
    return { success: true };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    return {
      success: false,
      message:
        "Bot protection is misconfigured. TURNSTILE_SECRET_KEY is missing.",
    };
  }

  if (!options.token) {
    return { success: false, message: "Bot verification is required." };
  }

  try {
    const body = new URLSearchParams({
      secret: secretKey,
      response: options.token,
    });

    if (options.ip) {
      body.append("remoteip", options.ip);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
      },
    );

    const data = (await response.json()) as TurnstileApiResponse;

    if (!response.ok || !data.success) {
      return {
        success: false,
        message:
          data?.["error-codes"]?.join(", ") || "Bot verification failed.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return {
      success: false,
      message: "Unable to verify bot challenge right now. Please try again.",
    };
  }
}
