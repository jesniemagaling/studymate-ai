import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  globalThis.mongooseCache ??
  (globalThis.mongooseCache = { conn: null, promise: null });

function isMongoDnsLookupError(error: unknown) {
  const e = error as { code?: string; syscall?: string };
  const dnsErrorCodes = ["ECONNREFUSED", "ENOTFOUND", "ENODATA", "EAI_AGAIN"];
  const dnsSyscalls = ["querySrv", "getaddrinfo"];

  return Boolean(
    e?.code &&
    e?.syscall &&
    dnsErrorCodes.includes(e.code) &&
    dnsSyscalls.includes(e.syscall),
  );
}

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  const mongoUriDirect = process.env.MONGODB_URI_DIRECT;

  if (!mongoUri) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        return await mongoose.connect(mongoUri, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 10000,
        });
      } catch (primaryError) {
        if (!mongoUriDirect) {
          throw primaryError;
        }

        try {
          return await mongoose.connect(mongoUriDirect, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
          });
        } catch {
          throw primaryError;
        }
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;

    if (isMongoDnsLookupError(error)) {
      throw new Error(
        "MongoDB hostname lookup failed. Your MONGODB_URI may be invalid/outdated, or DNS/network is blocking lookup. Copy a fresh URI from Atlas and optionally set MONGODB_URI_DIRECT as a non-SRV mongodb:// URI.",
      );
    }

    throw error;
  }
}
