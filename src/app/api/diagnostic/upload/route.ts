export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Record from "@/models/Record";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import Notification from "@/models/Notification";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uploaderDbId = (session.user as any).dbId;
  const uploaderRole = (session.user as any).role;
  if (uploaderRole !== "diagnostic" && uploaderRole !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { govId, type, title, date, hospital, aiSummary, category, fileUrl } = body;

    await connectToDatabase();
    const patient = await User.findOne({ govId }).select("-password");
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const record = await Record.create({
      patientId: patient._id,
      doctorId: uploaderDbId,
      hospital,
      type,
      title,
      date: new Date(date),
      aiSummary,
      category: category || "minor",
      fileUrl,
    });

    await AuditLog.create({
      performedBy: uploaderDbId,
      role: uploaderRole,
      action: "UPLOAD_SCAN",
      patientId: patient._id,
      details: `Uploaded ${type}: "${title}" for patient ${patient.name}.`,
    });

    await Notification.create({
      userId: patient._id,
      message: `New scan uploaded: ${type} - "${title}" by ${hospital}.`,
      type: "upload",
    });

    return NextResponse.json({ success: true, recordId: record._id });
  } catch {
    return NextResponse.json({ error: "Failed to upload scan" }, { status: 500 });
  }
}
