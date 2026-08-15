import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import QRSession from "@/models/QRSession";
import AuditLog from "@/models/AuditLog";
import Notification from "@/models/Notification";

declare global { var otpStore: Record<string, { otp: string; expiresAt: number; doctorId: string }> }
if (!global.otpStore) global.otpStore = {};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doctorDbId = (session.user as any).dbId;
  const doctorName = session.user?.name || "Doctor";

  try {
    const { sessionCode, otp } = await req.json();
    if (!sessionCode || !otp) return NextResponse.json({ error: "Session code and OTP are required" }, { status: 400 });

    const code = sessionCode.trim().toUpperCase();
    const stored = global.otpStore[code];

    if (!stored) return NextResponse.json({ error: "No OTP found for this session. Please re-validate." }, { status: 400 });
    if (Date.now() > stored.expiresAt) {
      delete global.otpStore[code];
      return NextResponse.json({ error: "OTP has expired. Please validate the session code again." }, { status: 400 });
    }
    if (stored.otp !== otp.trim()) return NextResponse.json({ error: "Incorrect OTP. Please try again." }, { status: 400 });

    // OTP verified — clear it
    delete global.otpStore[code];

    await connectToDatabase();
    const qrSession = await QRSession.findOne({ sessionId: code });
    if (!qrSession) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Mark session as accessed
    await QRSession.findByIdAndUpdate(qrSession._id, { status: "accessed", accessedBy: doctorDbId });

    // Audit log
    await AuditLog.create({
      performedBy: doctorDbId,
      role: "doctor",
      action: "QR_ACCESS",
      patientId: qrSession.patientId,
      details: `Dr. ${doctorName} verified OTP and accessed patient records. Access level: ${qrSession.accessLevel}`,
    });

    // Notify patient
    await Notification.create({
      userId: qrSession.patientId,
      message: `✅ Dr. ${doctorName} accessed your health records via QR scan (access level: ${qrSession.accessLevel}).`,
      type: "qr",
    });

    return NextResponse.json({
      success: true,
      patientId: qrSession.patientId.toString(),
      accessLevel: qrSession.accessLevel,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "OTP verification failed", detail: err?.message }, { status: 500 });
  }
}
