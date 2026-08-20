export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbId = (session.user as any).dbId;
  const role = (session.user as any).role;

  try {
    await connectToDatabase();
    const query: any = role === "admin" ? {} : { performedBy: dbId };
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .populate("performedBy", "name role")
      .populate("patientId", "name healthId govId")
      .limit(100)
      .lean();

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
