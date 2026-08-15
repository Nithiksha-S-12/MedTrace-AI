import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import QRSession from "@/models/QRSession";
import AuditLog from "@/models/AuditLog";
import Notification from "@/models/Notification";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doctorDbId = (session.user as any).dbId;
  const doctorName = session.user?.name || "Doctor";
  const doctorRole = (session.user as any).role;

  if (doctorRole !== "doctor" && doctorRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { govId, dob, reason } = await req.json();
    await connectToDatabase();

    const doctor = await User.findById(doctorDbId);
    const patient = await User.findOne({ govId }).select("-password");

    if (!patient) return NextResponse.json({ error: "Patient not found with this Government ID" }, { status: 404 });

    const patientDobStr = patient.dob ? new Date(patient.dob).toISOString().split("T")[0] : null;
    if (patientDobStr && dob && patientDobStr !== dob) {
      return NextResponse.json({ error: "Date of Birth does not match records" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
    const sessionId = "EMRG-" + randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();

    await QRSession.create({
      sessionId,
      patientId: patient._id,
      accessLevel: "emergency",
      duration: 15,
      status: "active",
      createdAt: now,
      expiresAt,
      isEmergency: true,
      accessedBy: doctorDbId,
    });

    await AuditLog.create({
      performedBy: doctorDbId,
      role: doctorRole,
      action: "EMERGENCY_OVERRIDE",
      patientId: patient._id,
      details: `Emergency access by ${doctorName} at ${doctor?.hospital || "Unknown"}. Reason: ${reason}`,
    });

    await Notification.create({
      userId: patient._id,
      message: `⚠️ Emergency Override: Dr. ${doctorName} accessed your critical medical records due to: ${reason}. Access expires in 15 minutes.`,
      type: "emergency",
    });

    return NextResponse.json({
      success: true,
      patientId: patient._id.toString(),
      sessionId,
      expiresAt: expiresAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to process emergency override" }, { status: 500 });
  }
}
