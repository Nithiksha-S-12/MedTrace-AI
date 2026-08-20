export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Record from "@/models/Record";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(req.url);
    const healthIdParam = searchParams.get("healthId");
    const govIdParam = searchParams.get("govId");
    const patientIdParam = searchParams.get("patientId");

    const target = healthIdParam || govIdParam || patientIdParam || (session?.user as any)?.healthId || (session?.user as any)?.dbId || (session?.user as any)?.govId;

    if (!target && !session?.user) {
      return NextResponse.json({ error: "Unauthorized or missing patient identifier" }, { status: 401 });
    }

    let patient: any = null;
    if (target) {
      if (mongoose.Types.ObjectId.isValid(target)) {
        patient = await User.findById(target).select("-password").lean();
      }
      if (!patient) {
        patient = await User.findOne({
          $or: [{ healthId: target }, { govId: target }],
        }).select("-password").lean();
      }
    }

    if (!patient && (session?.user as any)?.dbId) {
      patient = await User.findById((session?.user as any).dbId).select("-password").lean();
    }

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const records = await Record.find({ patientId: patient._id })
      .sort({ date: -1 })
      .populate("doctorId", "name hospital specialization")
      .lean();

    // Construct combined medical history text
    const recordSummaries = records
      .map((r: any) => `[${new Date(r.date).toLocaleDateString("en-IN")}] ${r.type}: ${r.title}. ${r.aiSummary || ""}`)
      .join("\n");

    const combinedHistory = patient.medicalHistory
      ? `${patient.medicalHistory}\n\n${recordSummaries}`
      : recordSummaries;

    return NextResponse.json({
      patient: {
        id: patient._id,
        name: patient.name,
        healthId: patient.healthId,
        govId: patient.govId,
        dob: patient.dob,
      },
      medicalHistory: combinedHistory || "No medical history recorded.",
      records,
      totalRecords: records.length,
    });
  } catch (err: any) {
    console.error("[Medical History GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch medical history", detail: err?.message }, { status: 500 });
  }
}
