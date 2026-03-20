import bcrypt from "bcrypt";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

const DEFAULT_ADMIN_EMAIL =
  process.env.DEFAULT_ADMIN_EMAIL || "admin@studymate.local";
const DEFAULT_ADMIN_PASSWORD =
  process.env.DEFAULT_ADMIN_PASSWORD || "admin12345";
const DEFAULT_ADMIN_FIRST_NAME =
  process.env.DEFAULT_ADMIN_FIRST_NAME || "System";
const DEFAULT_ADMIN_LAST_NAME = process.env.DEFAULT_ADMIN_LAST_NAME || "Admin";
const DEFAULT_ADMIN_ENABLED =
  String(process.env.DEFAULT_ADMIN_ENABLED || "true").toLowerCase() === "true";

let bootstrapped = false;

export function getDefaultAdminCredentials() {
  return {
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  };
}

export async function ensureDefaultAdminUser() {
  if (!DEFAULT_ADMIN_ENABLED || bootstrapped) {
    return;
  }

  await connectDB();

  const normalizedEmail = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();
  const existing = (await User.findOne({ email: normalizedEmail })
    .select("_id role")
    .lean()) as { _id?: unknown; role?: string } | null;

  if (!existing) {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    await User.create({
      firstName: DEFAULT_ADMIN_FIRST_NAME,
      lastName: DEFAULT_ADMIN_LAST_NAME,
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
    });
  } else if ((existing.role || "").toLowerCase() !== "admin") {
    await User.updateOne({ _id: existing._id }, { $set: { role: "admin" } });
  }

  bootstrapped = true;
}
