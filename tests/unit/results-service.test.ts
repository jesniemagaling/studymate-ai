import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn(),
}));

const { resultModelMock } = vi.hoisted(() => ({
  resultModelMock: {
    create: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    find: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

vi.mock("@/models/Result", () => ({
  default: resultModelMock,
}));

vi.mock("@/lib/results/normalize", () => ({
  normalizeStoredResult: vi.fn((raw: unknown) => ({
    result: raw,
    migrated: false,
  })),
}));

import {
  ResultNotFoundError,
  ResultValidationError,
  deleteResultForUser,
  getResultForUser,
  listResultsForUser,
  saveResultForUser,
  updateResultTitleForUser,
} from "@/lib/services/results";

describe("results service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws validation error when updating empty title", async () => {
    await expect(
      updateResultTitleForUser("u1", "r1", "  "),
    ).rejects.toBeInstanceOf(ResultValidationError);
  });

  it("throws not found when get result does not exist", async () => {
    (resultModelMock.findOne as Mock).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(getResultForUser("u1", "missing")).rejects.toBeInstanceOf(
      ResultNotFoundError,
    );
  });

  it("throws not found when delete target does not exist", async () => {
    (resultModelMock.findOneAndDelete as Mock).mockResolvedValue(null);

    await expect(deleteResultForUser("u1", "missing")).rejects.toBeInstanceOf(
      ResultNotFoundError,
    );
  });

  it("saves a valid result", async () => {
    (resultModelMock.create as Mock).mockResolvedValue({ _id: "r1" });

    const created = await saveResultForUser("u1", {
      type: "reviewer",
      title: "My reviewer",
      content: { summary: "test", keyPoints: [] },
    });

    expect(created).toEqual({ _id: "r1" });
    expect(resultModelMock.create).toHaveBeenCalled();
  });

  it("lists normalized results", async () => {
    (resultModelMock.find as Mock).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi
          .fn()
          .mockResolvedValue([
            { _id: "r1", type: "reviewer", title: "A", content: {} },
          ]),
      }),
    });

    const results = await listResultsForUser("u1");
    expect(results).toHaveLength(1);
  });

  it("throws validation error for invalid save payload", async () => {
    await expect(
      saveResultForUser("u1", {
        type: "quiz",
        title: "Bad quiz",
        content: { questions: [] },
      }),
    ).rejects.toBeInstanceOf(ResultValidationError);
  });
});
