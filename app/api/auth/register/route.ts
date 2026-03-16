import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      firstName,
      lastName,
      email,
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
