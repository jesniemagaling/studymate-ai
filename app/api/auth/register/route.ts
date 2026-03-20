import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { ensureDefaultAdminUser } from "@/lib/auth/bootstrap-admin";
import EmailVerificationCode from "@/models/EmailVerificationCode";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, verificationCode } =
      await req.json();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const normalizedCode = String(verificationCode || "").trim();

    // Validate input
    if (
      !firstName ||
      !lastName ||
      !normalizedEmail ||
      !password ||
      !normalizedCode
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    await connectDB();
    await ensureDefaultAdminUser();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 400 },
      );
    }

    const verificationRecord = await EmailVerificationCode.findOne({
      email: normalizedEmail,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!verificationRecord) {
      return NextResponse.json(
        {
          message:
            "Verification code is missing or expired. Please request a new code.",
        },
        { status: 400 },
      );
    }

    const isCodeValid = await bcrypt.compare(
      normalizedCode,
      verificationRecord.codeHash,
    );

    if (!isCodeValid) {
      const nextAttempts = (verificationRecord.attempts || 0) + 1;
      verificationRecord.attempts = nextAttempts;
      if (nextAttempts >= 5) {
        verificationRecord.used = true;
        verificationRecord.usedAt = new Date();
      }
      await verificationRecord.save();

      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 },
      );
    }

    verificationRecord.used = true;
    verificationRecord.usedAt = new Date();
    await verificationRecord.save();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);

    if (error instanceof Error) {
      const isMongoConnectionError =
        error.message.includes("MongoDB") ||
        error.message.includes("querySrv") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ECONNREFUSED");

      if (isMongoConnectionError) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
