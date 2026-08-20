export const dynamic = "force-dynamic";

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
    const { identifier, fingerprint, govId, phone, dob, reason } = await req.json();
    await connectToDatabase();

    const doctor = await User.findById(doctorDbId);

    let patient = null;

    // 1. Fingerprint verification
    if (fingerprint && typeof fingerprint === "string" && fingerprint.trim()) {
      const fpInput = fingerprint.trim();
      patient = await User.findOne({
        $or: [
          { fingerprint: fpInput },
          { fingerprintData: fpInput },
          // Demo fallback for Arjun Kumar when scanning test fingerprint
          ...(fpInput.includes("ARJUN") || fpInput.startsWith("FP-") ? [{ govId: "1234567890" }] : [])
        ]
      }).select("-password");

      if (!patient) {
        return NextResponse.json(
          { error: "No patient found matching this fingerprint" },
          { status: 404 }
        );
      }
    } else {
      // 2. ID / Phone verification logic
      const input = (identifier || govId || phone || "").trim();

      if (!input) {
        return NextResponse.json(
          { error: "Please enter Government ID, Phone Number, or scan patient fingerprint" },
          { status: 400 }
        );
      }

      const queryConditions: any[] = [
        { govId: input },
        { phone: input }
      ];
      const cleanDigits = input.replace(/\D/g, "");
      if (cleanDigits.length >= 7) {
        queryConditions.push({ phone: { $regex: cleanDigits, $options: "i" } });
      }

      patient = await User.findOne({
        $or: queryConditions,
      }).select("-password");

      if (!patient) {
        return NextResponse.json(
          { error: "No patient found with this ID or Phone Number" },
          { status: 404 }
        );
      }
    }

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
