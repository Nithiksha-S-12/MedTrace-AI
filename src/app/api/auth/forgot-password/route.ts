import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json({ message: "Identifier is required" }, { status: 400 });
    }

    const user = await User.findOne({
      $or: [
        { govId: identifier },
        { phone: identifier },
        { email: identifier },
        { healthId: identifier },
        { registrationNumber: identifier },
        { licenseNumber: identifier },
        { centreLicense: identifier }
      ]
    });

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({ message: "If an account matches, an OTP has been sent to your registered phone number." }, { status: 200 });
    }

    // Generate 6-digit OTP
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Mask phone number for display (e.g. ******7890)
    const phone = user.phone || "";
    const maskedPhone = phone.length > 4
      ? "*".repeat(phone.length - 4) + phone.slice(-4)
      : "****";

    // Simulate SMS OTP (hackathon demo)
    console.log(`\n\n=== HACKATHON DEMO: PASSWORD RESET OTP (SMS SIMULATION) ===`);
    console.log(`User: ${user.name} (${user.role})`);
    console.log(`Phone: ${phone}`);
    console.log(`OTP: ${resetToken}`);
    console.log(`Expires: ${resetTokenExpiry.toLocaleString()}`);
    console.log(`===========================================================\n\n`);

    return NextResponse.json({
      message: `OTP sent to your registered phone number ${maskedPhone}`,
      maskedPhone,
      // Demo only — remove in production
      demoOtp: resetToken,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
