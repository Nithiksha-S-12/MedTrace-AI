import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import QRSession from "@/models/QRSession";
import User from "@/models/User";

// In-memory OTP store: { [sessionId]: { otp, expiresAt, doctorId } }
declare global { var otpStore: Record<string, { otp: string; expiresAt: number; doctorId: string }> }
if (!global.otpStore) global.otpStore = {};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doctorDbId = (session.user as any).dbId;

  try {
    const { sessionCode } = await req.json();
    if (!sessionCode?.trim()) return NextResponse.json({ error: "Session code is required" }, { status: 400 });

    await connectToDatabase();
    const code = sessionCode.trim().toUpperCase();
    const qrSession = await QRSession.findOne({ sessionId: code }).populate("patientId", "name govId healthId");

    if (!qrSession) return NextResponse.json({ error: "Invalid session code. Please check and try again." }, { status: 404 });
    if (qrSession.status !== "active") return NextResponse.json({ error: `Session is ${qrSession.status}. Ask the patient to generate a new one.` }, { status: 400 });
    if (new Date(qrSession.expiresAt) < new Date()) {
      await QRSession.findByIdAndUpdate(qrSession._id, { status: "expired" });
      return NextResponse.json({ error: "Session has expired. Ask the patient to generate a new QR code." }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    global.otpStore[code] = { otp, expiresAt: otpExpiresAt, doctorId: doctorDbId };

    // In production, send OTP via SMS/email. For demo, console.log + return in response
    console.log(`\n🔐 OTP for session ${code}: ${otp} (expires in 5 minutes)\n`);

    const patient = qrSession.patientId as any;
    return NextResponse.json({
      success: true,
      otpSent: true,
      sessionId: code,
      patientName: patient?.name || "Unknown Patient",
      accessLevel: qrSession.accessLevel,
      expiresAt: qrSession.expiresAt,
      // Return OTP in response for demo purposes (remove in production)
      demoOtp: otp,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to validate session", detail: err?.message }, { status: 500 });
  }
}
