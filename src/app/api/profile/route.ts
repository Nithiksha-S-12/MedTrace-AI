export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

async function resolveUser(dbId: string) {
  if (mongoose.Types.ObjectId.isValid(dbId)) {
    return User.findById(dbId).select("-password").lean();
  }
  return User.findOne({ $or: [{ govId: dbId }, { licenseNumber: dbId }] }).select("-password").lean();
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbId = (session.user as any).dbId;
  try {
    await connectToDatabase();
    const user = await resolveUser(dbId);
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch profile", detail: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbId = (session.user as any).dbId;
  try {
    const { phone, email } = await req.json();
    await connectToDatabase();

    if (mongoose.Types.ObjectId.isValid(dbId)) {
      await User.findByIdAndUpdate(dbId, { phone, email });
    } else {
      await User.findOneAndUpdate({ $or: [{ govId: dbId }, { licenseNumber: dbId }] }, { phone, email });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update profile", detail: err.message }, { status: 500 });
  }
}
