import { describe, expect, it } from "vitest";

import { apiError, apiSuccess } from "@/lib/api/response";

describe("api response envelope", () => {
  it("returns standardized success payload", async () => {
    const response = apiSuccess({ result: { id: "123" } }, "Saved", 201);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.message).toBe("Saved");
    expect(json.data.result.id).toBe("123");
    // Backward-compatible mirrored top-level field.
    expect(json.result.id).toBe("123");
  });

  it("returns standardized error payload", async () => {
    const response = apiError({
      message: "Unauthorized",
      status: 401,
      errorCode: "UNAUTHORIZED",
    });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.message).toBe("Unauthorized");
    expect(json.errorCode).toBe("UNAUTHORIZED");
    expect(json.error).toBe("Unauthorized");
  });

  it("includes optional details in error payload", async () => {
    const response = apiError({
      message: "Invalid payload",
      status: 400,
      errorCode: "INVALID_PAYLOAD",
      details: [{ field: "title" }],
    });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.errorCode).toBe("INVALID_PAYLOAD");
    expect(Array.isArray(json.details)).toBe(true);
  });
});
