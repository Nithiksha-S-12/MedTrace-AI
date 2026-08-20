export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import QRSession from "@/models/QRSession";
import AuditLog from "@/models/AuditLog";
import Notification from "@/models/Notification";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doctorDbId = (session.user as any).dbId;
  const doctorName = session.user?.name || "Doctor";

  try {
    const { sessionCode } = await req.json();
    await connectToDatabase();

    const qrSession = await QRSession.findOne({ sessionId: sessionCode.trim().toUpperCase() });
    if (!qrSession) return NextResponse.json({ error: "Session not found or already used" }, { status: 404 });

    const now = new Date();
    if (qrSession.status !== "active") return NextResponse.json({ error: "Session is no longer active" }, { status: 400 });
    if (new Date(qrSession.expiresAt) < now) {
      await QRSession.findByIdAndUpdate(qrSession._id, { status: "expired" });
      return NextResponse.json({ error: "Session has expired" }, { status: 400 });
    }

    // Update session to accessed
    await QRSession.findByIdAndUpdate(qrSession._id, { status: "accessed", accessedBy: doctorDbId });

    // Create audit log
    await AuditLog.create({
      performedBy: doctorDbId,
      role: "doctor",
      action: "QR_ACCESS",
      patientId: qrSession.patientId,
      details: `Doctor ${doctorName} accessed patient records via QR scan. Access level: ${qrSession.accessLevel}`,
    });

    // Notify patient
    await Notification.create({
      userId: qrSession.patientId,
      message: `Dr. ${doctorName} scanned your QR code and accessed your health records.`,
      type: "qr",
    });

    return NextResponse.json({
      success: true,
      patientId: qrSession.patientId.toString(),
      accessLevel: qrSession.accessLevel,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process QR scan" }, { status: 500 });
  }
}
