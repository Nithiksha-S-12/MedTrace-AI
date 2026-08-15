import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Record from "@/models/Record";

async function seedDatabase() {
  await connectToDatabase();

  // Clear existing users and records
  await User.deleteMany({});
  await Record.deleteMany({});

  // Insert Admin
  const admin = await User.create({
    name: "System Administrator",
    role: "admin",
    licenseNumber: "ADMIN001",
    password: "password",
    isVerified: true,
  });

  // Insert Citizens (Gov IDs: 1234567890, 9876543210, 5555555555)
  const [arjun, preethi, ravi] = await User.insertMany([
    {
      name: "Arjun Kumar",
      role: "citizen",
      govId: "1234567890",
      healthId: "HID-A7X2K",
      password: "password",
      dob: "1985-05-15",
      phone: "+91-9876543210",
      email: "arjun@example.com",
      isVerified: true,
      medicalHistory: "Diagnosed with Stage 1 Hypertension in Jan 2023. Prescribed Amlodipine 5mg OD. Routine CBC in May 2023 was normal (Hb 14.2 g/dL). Mild sinus bradycardia noted on ECG in Feb 2024. Normal MRI brain study in June 2024 for headache investigation. Known allergy to Penicillin.",
    },
    {
      name: "Preethi Nair",
      role: "citizen",
      govId: "9876543210",
      healthId: "HID-P9N3R",
      password: "password",
      dob: "1990-11-20",
      phone: "+91-9812345678",
      email: "preethi@example.com",
      isVerified: true,
      medicalHistory: "Diagnosed with Type 2 Diabetes in Aug 2022 (HbA1c 7.8%). Prescribed Metformin 500mg BD. Elevated LDL cholesterol (142 mg/dL) in Mar 2024, started statin therapy. Penicillin allergy.",
    },
    {
      name: "Ravi Shankar",
      role: "citizen",
      govId: "5555555555",
      healthId: "HID-R5V8K",
      password: "password",
      dob: "1975-02-10",
      phone: "+91-9900112233",
      email: "ravi@example.com",
      isVerified: true,
      medicalHistory: "History of Asthma. Seasonal allergic rhinitis.",
    },
  ]);

  // Insert Doctors & Diagnostic (DOC001, DOC002)
  const [docPriya, docRajesh] = await User.insertMany([
    {
      name: "Dr. Priya Sharma",
      role: "doctor",
      licenseNumber: "DOC001",
      password: "password",
      hospital: "City Hospital",
      specialization: "Cardiology",
      isVerified: true,
    },
    {
      name: "Dr. Rajesh Mehta",
      role: "diagnostic",
      licenseNumber: "DOC002",
      password: "password",
      hospital: "Apollo Diagnostics",
      specialization: "Radiology",
      isVerified: true,
    },
  ]);

  // Insert Medical Records for Arjun Kumar (1234567890)
  await Record.insertMany([
    {
      patientId: arjun._id,
      doctorId: docPriya._id,
      hospital: "City Hospital",
      type: "Prescription",
      title: "Hypertension Medication - Annual Review",
      date: new Date("2023-01-10"),
      aiSummary: "Patient diagnosed with Stage 1 Hypertension. Prescribed Amlodipine 5mg OD. Follow-up in 3 months.",
      category: "chronic",
    },
    {
      patientId: arjun._id,
      doctorId: docPriya._id,
      hospital: "City Hospital",
      type: "Lab Report",
      title: "Complete Blood Count - Routine",
      date: new Date("2023-05-20"),
      aiSummary: "CBC within normal limits. Hemoglobin: 14.2 g/dL. No abnormalities detected.",
      category: "minor",
    },
    {
      patientId: arjun._id,
      doctorId: docPriya._id,
      hospital: "City Hospital",
      type: "Scan",
      title: "ECG - Cardiac Assessment",
      date: new Date("2024-02-15"),
      aiSummary: "Mild sinus bradycardia noted. No ST changes. Echocardiogram recommended.",
      category: "critical",
    },
    {
      patientId: arjun._id,
      doctorId: docRajesh._id,
      hospital: "Apollo Diagnostics",
      type: "Scan",
      title: "Brain MRI - Headache Investigation",
      date: new Date("2024-06-01"),
      aiSummary: "No intracranial abnormality detected. Normal MRI brain study.",
      category: "minor",
    },
  ]);

  // Insert Medical Records for Preethi Nair (9876543210)
  await Record.insertMany([
    {
      patientId: preethi._id,
      doctorId: docPriya._id,
      hospital: "City Hospital",
      type: "Prescription",
      title: "Type 2 Diabetes Management",
      date: new Date("2022-08-12"),
      aiSummary: "HbA1c: 7.8%. Prescribed Metformin 500mg BD. Penicillin allergy noted.",
      category: "chronic",
    },
    {
      patientId: preethi._id,
      doctorId: docRajesh._id,
      hospital: "Apollo Diagnostics",
      type: "Lab Report",
      title: "Lipid Profile - Annual Screening",
      date: new Date("2024-03-30"),
      aiSummary: "LDL elevated at 142 mg/dL. Statin therapy initiated.",
      category: "chronic",
    },
  ]);
}

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ message: "Seeding complete! ✅" });
  } catch (err: any) {
    console.error("Seed endpoint error:", err);
    return NextResponse.json({ error: "Seeding failed", detail: err?.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({ message: "Seeding complete! ✅" });
  } catch (err: any) {
    console.error("Seed endpoint error:", err);
    return NextResponse.json({ error: "Seeding failed", detail: err?.message }, { status: 500 });
  }
}
