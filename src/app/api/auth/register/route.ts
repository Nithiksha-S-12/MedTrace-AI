import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      role, name, password, email, phone, 
      govId, dob, // Citizen specific
      registrationNumber, licenseProof, hospitalId, specialization, experience, // Doctor specific
      centreLicense, centreName, address // Scan Centre specific
    } = body;

    if (!role || !name || !password || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    // Check for existing user with same email or phone
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email or phone already registered" }, { status: 400 });
    }

    // Role-specific unique checks
    if (role === "citizen") {
      const existingAadhaar = await User.findOne({ govId });
      if (existingAadhaar) return NextResponse.json({ error: "Aadhaar already registered" }, { status: 400 });
    } else if (role === "doctor") {
      const existingReg = await User.findOne({ registrationNumber });
      if (existingReg) return NextResponse.json({ error: "Registration number already registered" }, { status: 400 });
    } else if (role === "diagnostic") {
      const existingLicense = await User.findOne({ 
        $or: [{ registrationNumber }, { centreLicense }]
      });
      if (existingLicense) return NextResponse.json({ error: "Registration or License number already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare new user data
    const newUserData: any = {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      isVerified: false,
    };

    if (role === "citizen") {
      newUserData.govId = govId;
      newUserData.dob = dob;
      newUserData.isVerified = true; // Citizens verified immediately via OTP
      // Generate Health ID: HID-XXXXX
      newUserData.healthId = "HID-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    } else if (role === "doctor") {
      newUserData.registrationNumber = registrationNumber;
      newUserData.licenseProof = licenseProof;
      newUserData.hospitalId = hospitalId;
      newUserData.specialization = specialization;
      newUserData.experience = experience;
      newUserData.status = "pending";
    } else if (role === "diagnostic") {
      newUserData.registrationNumber = registrationNumber;
      newUserData.centreLicense = centreLicense;
      newUserData.centreName = centreName;
      newUserData.address = address;
      newUserData.hospitalId = hospitalId;
      newUserData.specialization = specialization;
      newUserData.experience = experience;
      newUserData.status = "pending";
    }

    const newUser = await User.create(newUserData);

    return NextResponse.json({ message: "User registered successfully", userId: newUser._id, healthId: newUser.healthId }, { status: 201 });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
