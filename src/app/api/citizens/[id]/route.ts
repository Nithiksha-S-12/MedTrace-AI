import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Record from "@/models/Record";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  try {
    await connectToDatabase();
    const patient = await User.findById(id).select("-password").lean();
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const records = await Record.find({ patientId: id })
      .sort({ date: -1 })
      .populate("doctorId", "name hospital specialization")
      .lean();

    return NextResponse.json({ patient, records });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
