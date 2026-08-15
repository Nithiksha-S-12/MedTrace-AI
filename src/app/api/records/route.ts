import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Record from "@/models/Record";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let patientId = searchParams.get("patientId");
  const type = searchParams.get("type");

  try {
    await connectToDatabase();

    // Resolve patientId — if not a valid ObjectId, try to find by govId/healthId
    if (patientId && !mongoose.Types.ObjectId.isValid(patientId)) {
      const user = await User.findOne({ $or: [{ govId: patientId }, { healthId: patientId }] }).lean() as any;
      if (user) patientId = user._id.toString();
      else return NextResponse.json({ records: [] });
    }

    const query: any = {};
    if (patientId) query.patientId = patientId;
    if (type && type !== "all") query.type = { $regex: type, $options: "i" };

    const records = await Record.find(query)
      .sort({ date: -1 })
      .populate("doctorId", "name hospital specialization")
      .lean();

    return NextResponse.json({ records });
  } catch (err: any) {
    console.error("Records API error:", err.message);
    return NextResponse.json({ error: "Database error", detail: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    await connectToDatabase();
    const record = await Record.create(body);
    return NextResponse.json({ record });
  } catch (err: any) {
    return NextResponse.json({ error: "Database error", detail: err.message }, { status: 500 });
  }
}
