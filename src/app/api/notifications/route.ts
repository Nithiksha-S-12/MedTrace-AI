export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Notification from "@/models/Notification";
import User from "@/models/User";
import mongoose from "mongoose";

async function resolveDbId(dbId: string) {
  if (mongoose.Types.ObjectId.isValid(dbId)) return dbId;
  const user = await User.findOne({ $or: [{ govId: dbId }, { licenseNumber: dbId }] }).lean() as any;
  return user?._id?.toString() || null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rawId = (session.user as any).dbId;
  try {
    await connectToDatabase();
    const dbId = await resolveDbId(rawId);
    if (!dbId) return NextResponse.json({ notifications: [] });

    const notifications = await Notification.find({ userId: dbId }).sort({ timestamp: -1 }).limit(50).lean();
    return NextResponse.json({ notifications });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch notifications", detail: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { notificationId } = await req.json();
    await connectToDatabase();
    await Notification.findByIdAndUpdate(notificationId, { status: "read" });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update notification", detail: err.message }, { status: 500 });
  }
}
