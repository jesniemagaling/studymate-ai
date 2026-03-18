import { NextRequest } from "next/server";
import { describe, expect, it, vi, type Mock } from "vitest";

vi.mock("@/lib/auth/user-id", () => ({
  getUserIdFromRequest: vi.fn(),
}));

vi.mock("@/lib/services/results", () => ({
  listResultsForUser: vi.fn(),
}));

vi.mock("@/lib/debug", () => ({
  debug: vi.fn(),
}));

import { GET } from "@/app/api/results/list/route";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import { listResultsForUser } from "@/lib/services/results";

describe("GET /api/results/list", () => {
  it("returns unauthorized when user is missing", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/results/list");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe("Unauthorized");
    expect(data.errorCode).toBe("UNAUTHORIZED");
  });

  it("returns results for authenticated user", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue("user-1");
    (listResultsForUser as Mock).mockResolvedValue([
      { id: "r1", type: "reviewer", title: "A" },
    ]);

    const req = new NextRequest("http://localhost/api/results/list");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Results fetched");
    expect(Array.isArray(data.data.results)).toBe(true);
    expect(data.results).toHaveLength(1);
    expect(data.results[0].id).toBe("r1");
  });
});
