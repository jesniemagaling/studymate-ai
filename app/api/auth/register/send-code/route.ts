import { randomInt } from "crypto";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import EmailVerificationCode from "@/models/EmailVerificationCode";
import { sendVerificationCodeEmail } from "@/lib/email/mailer";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { email, turnstileToken } = await req.json();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const botCheck = await verifyTurnstileToken({ token: turnstileToken });
    if (!botCheck.success) {
      return NextResponse.json(
        { message: botCheck.message || "Bot verification failed." },
        { status: 400 },
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: normalizedEmail })
      .select("_id")
      .lean();

    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered." },
        { status: 400 },
      );
    }

    const sentRecently = await EmailVerificationCode.findOne({
      email: normalizedEmail,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    })
      .select("_id")
      .lean();

    if (sentRecently) {
      return NextResponse.json(
        { message: "Please wait a minute before requesting a new code." },
        { status: 429 },
      );
    }

    const code = String(randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, 10);

    const verificationDoc = await EmailVerificationCode.create({
      email: normalizedEmail,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      used: false,
      attempts: 0,
    });

    try {
      await sendVerificationCodeEmail({ to: normalizedEmail, code });
    } catch (emailError) {
      await EmailVerificationCode.deleteOne({ _id: verificationDoc._id });
      console.error("Send verification code email error:", emailError);
      return NextResponse.json(
        { message: "Unable to send verification code right now." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Verification code sent to your email." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Send code route error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}
