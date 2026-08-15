import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import QRSession from "@/models/QRSession";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbId = (session.user as any).dbId;
  if (!dbId) return NextResponse.json({ error: "Invalid user" }, { status: 400 });

  try {
    const { accessLevel, duration } = await req.json();
    await connectToDatabase();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 1000);
    const sessionId = randomUUID().replace(/-/g, "").substring(0, 12).toUpperCase();

    const qrSession = await QRSession.create({
      sessionId,
      patientId: dbId,
      accessLevel,
      duration,
      status: "active",
      createdAt: now,
      expiresAt,
      isEmergency: false,
    });

    return NextResponse.json({ sessionId: qrSession.sessionId, expiresAt: qrSession.expiresAt });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR session" }, { status: 500 });
  }
}
