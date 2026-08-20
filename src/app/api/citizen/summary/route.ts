export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
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

    let citizen: any = null;
    if (target) {
      if (mongoose.Types.ObjectId.isValid(target)) {
        citizen = await User.findById(target).select("-password").lean();
      }
      if (!citizen) {
        citizen = await User.findOne({
          $or: [{ healthId: target }, { govId: target }],
        }).select("-password").lean();
      }
    }

    if (!citizen && (session?.user as any)?.dbId) {
      citizen = await User.findById((session?.user as any).dbId).select("-password").lean();
    }

    if (!citizen) {
      return NextResponse.json({ error: "Citizen not found" }, { status: 404 });
    }

    const aiSummary = citizen.aiSummary || null;

    return NextResponse.json({
      summary: aiSummary,
      criticalAlerts: aiSummary?.criticalAlerts || null,
      chronicConditions: aiSummary?.chronicConditions || null,
      minorHistory: aiSummary?.minorHistory || null,
      erSnapshot: aiSummary?.summary || null,
      patient: {
        id: citizen._id,
        name: citizen.name,
        healthId: citizen.healthId,
        govId: citizen.govId,
      },
    });
  } catch (err: any) {
    console.error("[Citizen Summary GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch citizen summary", detail: err?.message }, { status: 500 });
  }
}
