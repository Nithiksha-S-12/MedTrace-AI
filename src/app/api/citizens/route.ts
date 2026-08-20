export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await connectToDatabase();
    const query = id
      ? { $or: [{ govId: id }, { healthId: id }], role: "citizen" }
      : { role: "citizen" };

    const citizens = await User.find(query).select("-password").limit(50).lean();
    return NextResponse.json({ citizens });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
