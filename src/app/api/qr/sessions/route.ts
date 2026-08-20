export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import QRSession from "@/models/QRSession";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let dbId = (session.user as any).dbId;
  try {
    await connectToDatabase();

    // Resolve non-ObjectId dbId
    if (!mongoose.Types.ObjectId.isValid(dbId)) {
      const user = await User.findOne({ $or: [{ govId: dbId }, { licenseNumber: dbId }] }).lean() as any;
      if (user) dbId = user._id.toString();
      else return NextResponse.json({ sessions: [] });
    }

    const sessions = await QRSession.find({ patientId: dbId, status: "active" }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ sessions });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch QR sessions", detail: err.message }, { status: 500 });
  }
}
