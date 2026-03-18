import { NextRequest } from "next/server";
import { describe, expect, it, vi, type Mock } from "vitest";

vi.mock("@/lib/auth/user-id", () => ({
  getUserIdFromRequest: vi.fn(),
}));

vi.mock("@/lib/services/results", () => ({
  getResultForUser: vi.fn(),
  updateResultTitleForUser: vi.fn(),
  deleteResultForUser: vi.fn(),
  ResultNotFoundError: class ResultNotFoundError extends Error {},
  ResultValidationError: class ResultValidationError extends Error {},
}));

import { GET } from "@/app/api/results/get/[id]/route";
import { PATCH } from "@/app/api/results/update/[id]/route";
import { DELETE } from "@/app/api/results/delete/[id]/route";
import { getUserIdFromRequest } from "@/lib/auth/user-id";
import {
  getResultForUser,
  updateResultTitleForUser,
  deleteResultForUser,
  ResultNotFoundError,
  ResultValidationError,
} from "@/lib/services/results";

describe("results route contracts", () => {
  it("GET returns unauthorized envelope", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/results/get/r1");
    const res = await GET(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe("UNAUTHORIZED");
  });

  it("GET returns standard envelope", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue("user-1");
    (getResultForUser as Mock).mockResolvedValue({
      id: "r1",
      type: "reviewer",
      title: "Sample",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-1",
      content: { summary: "hello", keyPoints: [] },
    });

    const req = new NextRequest("http://localhost/api/results/get/r1");
    const res = await GET(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Result fetched");
    expect(data.data.result.id).toBe("r1");
    expect(data.result.id).toBe("r1");
  });

  it("GET returns not found envelope", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue("user-1");
    (getResultForUser as Mock).mockRejectedValue(new ResultNotFoundError());

    const req = new NextRequest("http://localhost/api/results/get/missing");
    const res = await GET(req, {
      params: Promise.resolve({ id: "missing" }),
    });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe("RESULT_NOT_FOUND");
  });

  it("PATCH returns unauthorized envelope", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/results/update/r1", {
      method: "PATCH",
      body: JSON.stringify({ title: "Updated" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe("UNAUTHORIZED");
  });

  it("PATCH returns standard envelope", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue("user-1");
    (updateResultTitleForUser as Mock).mockResolvedValue("Updated");

    const req = new NextRequest("http://localhost/api/results/update/r1", {
      method: "PATCH",
      body: JSON.stringify({ title: "Updated" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Title updated");
    expect(data.data.title).toBe("Updated");
    expect(data.title).toBe("Updated");
  });

  it("PATCH returns validation envelope", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue("user-1");
    (updateResultTitleForUser as Mock).mockRejectedValue(
      new ResultValidationError("Title is required"),
    );

    const req = new NextRequest("http://localhost/api/results/update/r1", {
      method: "PATCH",
      body: JSON.stringify({ title: "" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe("INVALID_TITLE");
  });

  it("PATCH returns not found envelope", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue("user-1");
    (updateResultTitleForUser as Mock).mockRejectedValue(
      new ResultNotFoundError(),
    );

    const req = new NextRequest("http://localhost/api/results/update/r1", {
      method: "PATCH",
      body: JSON.stringify({ title: "New" }),
      headers: { "content-type": "application/json" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe("RESULT_NOT_FOUND");
  });

  it("DELETE returns unauthorized envelope", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/results/delete/r1", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe("UNAUTHORIZED");
  });

  it("DELETE returns standard envelope", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue("user-1");
    (deleteResultForUser as Mock).mockResolvedValue(undefined);

    const req = new NextRequest("http://localhost/api/results/delete/r1", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Deleted successfully");
    expect(data.data).toEqual({});
  });

  it("DELETE returns not found envelope", async () => {
    (getUserIdFromRequest as Mock).mockResolvedValue("user-1");
    (deleteResultForUser as Mock).mockRejectedValue(new ResultNotFoundError());

    const req = new NextRequest("http://localhost/api/results/delete/r1", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: "r1" }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.errorCode).toBe("RESULT_NOT_FOUND");
  });
});
