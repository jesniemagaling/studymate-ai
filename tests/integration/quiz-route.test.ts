import { NextRequest } from "next/server";
import { describe, expect, it, vi, type Mock } from "vitest";

vi.mock("@/lib/auth/user-id", () => ({
  getUserIdFromRequest: vi.fn(),
}));

import { POST } from "@/app/api/ai/quiz/route";
import { getUserIdFromRequest } from "@/lib/auth/user-id";

describe("POST /api/ai/quiz", () => {
  it("returns unauthorized when user is missing", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/ai/quiz", {
      method: "POST",
      body: JSON.stringify({ text: "hello world" }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Unauthorized");
    expect(data.errorCode).toBe("UNAUTHORIZED");
  });

  it("returns validation error for invalid payload", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue("user-1");

    const req = new NextRequest("http://localhost/api/ai/quiz", {
      method: "POST",
      body: JSON.stringify({ text: "" }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe("No text provided");
    expect(data.errorCode).toBe("INVALID_QUIZ_INPUT");
  });

  it("returns generated quiz for valid payload", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue("user-1");

    const req = new NextRequest("http://localhost/api/ai/quiz", {
      method: "POST",
      body: JSON.stringify({
        text: "Photosynthesis converts sunlight into chemical energy for plants.",
        count: 1,
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Quiz generated");
    expect(Array.isArray(data.data.questions)).toBe(true);
    expect(Array.isArray(data.questions)).toBe(true);
    expect(data.questions.length).toBe(1);
  });
});
