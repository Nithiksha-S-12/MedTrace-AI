import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { adminId, targetUserId, status } = await req.json();

    if (!adminId || !targetUserId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { status, isVerified: status === "approved" },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: `User status updated to ${status}` }, { status: 200 });
  } catch (error) {
    console.error("Verify Doctor Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
