import { z } from "zod";

import { connectDB } from "@/lib/db";
import Result from "@/models/Result";
import { SaveResultSchema } from "@/lib/validation/result";
import {
  normalizeStoredResult,
  type LegacyResult,
} from "@/lib/results/normalize";

export class ResultValidationError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ResultValidationError";
  }
}

export class ResultNotFoundError extends Error {
  constructor(message = "Result not found") {
    super(message);
    this.name = "ResultNotFoundError";
  }
}

export async function saveResultForUser(userId: string, rawBody: unknown) {
  try {
    const parsed = SaveResultSchema.parse(rawBody);

    await connectDB();

    const created = await Result.create({
      userId,
      title: parsed.title?.trim() || "Untitled Result",
      type: parsed.type,
      content: parsed.content,
    });

    return created;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ResultValidationError("Invalid result payload", error.issues);
    }

    throw error;
  }
}

export async function getResultForUser(userId: string, id: string) {
  await connectDB();

  const rawResult = await Result.findOne({ _id: id, userId }).lean();

  if (!rawResult) {
    throw new ResultNotFoundError();
  }

  const { result, migrated } = normalizeStoredResult(rawResult as LegacyResult);

  if (migrated) {
    await Result.updateOne(
      { _id: id, userId },
      {
        $set: {
          type: result.type,
          content: result.content,
        },
        $unset: {
          reviewer: "",
          quiz: "",
          flashcards: "",
        },
      },
    );
  }

  return result;
}

export async function updateResultTitleForUser(
  userId: string,
  id: string,
  title: string,
) {
  const nextTitle = String(title || "").trim();

  if (!nextTitle) {
    throw new ResultValidationError("Title is required");
  }

  await connectDB();

  const updated = await Result.findOneAndUpdate(
    { _id: id, userId },
    { $set: { title: nextTitle } },
    { new: true },
  ).lean<{ title: string }>();

  if (!updated) {
    throw new ResultNotFoundError();
  }

  return updated.title;
}

export async function listResultsForUser(userId: string) {
  await connectDB();

  const rawResults = await Result.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return rawResults.map(
    (raw) => normalizeStoredResult(raw as LegacyResult).result,
  );
}

export async function deleteResultForUser(userId: string, id: string) {
  await connectDB();

  const deleted = await Result.findOneAndDelete({
    _id: id,
    userId,
  });

  if (!deleted) {
    throw new ResultNotFoundError();
  }
}
