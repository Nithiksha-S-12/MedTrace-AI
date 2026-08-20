import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, phone, otp } = await req.json();

    if (!email || !phone || !otp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Simulate OTP verification (hackathon requirement)
    console.log(`[OTP VERIFICATION] Verifying OTP for Email: ${email}, Phone: ${phone}`);
    console.log(`[OTP VERIFICATION] OTP Entered: ${otp}`);
    console.log(`[OTP VERIFICATION] Simulated OTP match successful.`);

    // In a real app, you would check against an OTP store or service (like Twilio/SendGrid)
    
    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
