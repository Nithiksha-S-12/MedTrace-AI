export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import QRSession from "@/models/QRSession";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbId = (session.user as any).dbId;
  try {
    const { sessionId } = await req.json();
    await connectToDatabase();

    const qrSession = await QRSession.findOneAndUpdate(
      { sessionId, patientId: dbId },
      { status: "revoked" },
      { new: true }
    );

    if (!qrSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to revoke QR session" }, { status: 500 });
  }
}
