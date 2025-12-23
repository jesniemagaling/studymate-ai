import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function GET() {
  await connectDB();

  const userCount = await User.countDocuments();

  return NextResponse.json({
    message: 'Database connected successfully',
    users: userCount,
  });
}
