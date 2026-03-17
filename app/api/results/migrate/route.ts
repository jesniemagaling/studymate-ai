import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { connectDB } from '@/lib/db';
import Result from '@/models/Result';
import { normalizeStoredResult, type LegacyResult } from '@/lib/results/normalize';

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let dryRun = false;

  try {
    const body = await req.json().catch(() => ({}));
    dryRun = Boolean(body?.dryRun);
  } catch {
    dryRun = false;
  }

  await connectDB();

  const rawResults = await Result.find({ userId: token.id }).lean();

  const migrationOps = rawResults
    .map((raw) => {
      const normalized = normalizeStoredResult(raw as LegacyResult);

      if (!normalized.migrated) {
        return null;
      }

      return {
        updateOne: {
          filter: { _id: raw._id, userId: token.id },
          update: {
            $set: {
              type: normalized.result.type,
              content: normalized.result.content,
            },
            $unset: {
              reviewer: '',
              quiz: '',
              flashcards: '',
            },
          },
        },
      };
    })
    .filter((op): op is NonNullable<typeof op> => op !== null);

  if (!migrationOps.length) {
    return NextResponse.json({
      message: 'No legacy records found',
      scanned: rawResults.length,
      migrated: 0,
      dryRun,
    });
  }

  if (dryRun) {
    return NextResponse.json({
      message: 'Dry run complete',
      scanned: rawResults.length,
      migratable: migrationOps.length,
      dryRun: true,
    });
  }

  const writeResult = await Result.bulkWrite(migrationOps);

  return NextResponse.json({
    message: 'Migration complete',
    scanned: rawResults.length,
    migrated: writeResult.modifiedCount,
    dryRun: false,
  });
}
