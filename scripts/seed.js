const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://nithiksha12s_db_user:Z25jWMVLf1Z0ZDNR@ac-ec1f6rx-shard-00-00.zdfq0o4.mongodb.net:27017,ac-ec1f6rx-shard-00-01.zdfq0o4.mongodb.net:27017,ac-ec1f6rx-shard-00-02.zdfq0o4.mongodb.net:27017/?ssl=true&replicaSet=atlas-6ynj0w-shard-0&authSource=admin&retryWrites=true&w=majority";

async function seed() {
  try {
    console.log("Connecting to MongoDB Atlas (standard connection)...");
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000, tls: true });
    console.log("✅ Connected!");

    const userSchema = new mongoose.Schema({}, { strict: false });
    const recordSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model("User", userSchema);
    const Record = mongoose.models.Record || mongoose.model("Record", recordSchema);

    await User.deleteMany({});
    await Record.deleteMany({});
    console.log("🗑  Cleared existing data.");

    // Admin
    await User.create({
      name: "System Administrator", role: "admin",
      licenseNumber: "ADMIN001", password: "password", email: "admin@medtrace.com", isVerified: true, healthId: "HID-ADMIN"
    });

    // Citizens
    const [john, jane, robert] = await User.insertMany([
      {
        name: "Arjun Kumar", role: "citizen", govId: "123456789012", healthId: "HID-A7X2K", password: "password", dob: "1985-05-15", phone: "9876543210", email: "arjun@example.com", isVerified: true,
        medicalHistory: "Diagnosed with Stage 1 Hypertension in Jan 2023. Prescribed Amlodipine 5mg OD. Routine CBC in May 2023 was normal (Hb 14.2 g/dL). Mild sinus bradycardia noted on ECG in Feb 2024. Normal MRI brain study in June 2024 for headache investigation. Known allergy to Penicillin."
      },
      {
        name: "Preethi Nair", role: "citizen", govId: "0987654321", healthId: "HID-P9N3R", password: "password", dob: "1990-11-20", phone: "+91-9812345678", email: "preethi@example.com", isVerified: true,
        medicalHistory: "Diagnosed with Type 2 Diabetes in Aug 2022 (HbA1c 7.8%). Prescribed Metformin 500mg BD. Elevated LDL cholesterol (142 mg/dL) in Mar 2024, started statin therapy. Penicillin allergy."
      },
      {
        name: "Ravi Shankar", role: "citizen", govId: "1122334455", healthId: "HID-R5V8K", password: "password", dob: "1975-02-10", phone: "+91-9900112233", email: "ravi@example.com", isVerified: true,
        medicalHistory: "History of Asthma. Seasonal allergic rhinitis."
      }
    ]);

    // Doctors & Diagnostic
    const [priya, rajesh, amit] = await User.insertMany([
      { name: "Dr. Priya Sharma", role: "doctor", licenseNumber: "DOC001", registrationNumber: "DOC001", phone: "9876543211", password: "password", hospital: "City Hospital", specialization: "Cardiology", isVerified: true, healthId: "HID-D1X2K" },
      { name: "Dr. Rajesh Mehta", role: "diagnostic", licenseNumber: "DOC002", registrationNumber: "DOC002", phone: "9876543212", password: "password", hospital: "Apollo Diagnostics", isVerified: true, healthId: "HID-D2X3K" },
      { name: "Dr. Amit Gupta", role: "doctor", licenseNumber: "DOC003", registrationNumber: "DOC003", phone: "9876543213", password: "password", hospital: "AIIMS", specialization: "General Medicine", isVerified: true, healthId: "HID-D3X4K" }
    ]);

    // Medical Records for Arjun Kumar
    await Record.insertMany([
      {
        patientId: john._id, doctorId: priya._id, hospital: "City Hospital",
        type: "Prescription", title: "Hypertension Medication - Annual Review",
        date: new Date("2023-01-10"),
        aiSummary: "Patient diagnosed with Stage 1 Hypertension. Prescribed Amlodipine 5mg OD. Follow-up in 3 months.",
        category: "chronic"
      },
      {
        patientId: john._id, doctorId: amit._id, hospital: "AIIMS",
        type: "Lab Report", title: "Complete Blood Count - Routine",
        date: new Date("2023-05-20"),
        aiSummary: "CBC within normal limits. Hemoglobin: 14.2 g/dL. No abnormalities detected.",
        category: "minor"
      },
      {
        patientId: john._id, doctorId: priya._id, hospital: "City Hospital",
        type: "Scan", title: "ECG - Cardiac Assessment",
        date: new Date("2024-02-15"),
        aiSummary: "Mild sinus bradycardia noted. No ST changes. Echocardiogram recommended.",
        category: "critical"
      },
      {
        patientId: john._id, doctorId: rajesh._id, hospital: "Apollo Diagnostics",
        type: "Scan", title: "Brain MRI - Headache Investigation",
        date: new Date("2024-06-01"),
        aiSummary: "No intracranial abnormality detected. Normal MRI brain study.",
        category: "minor"
      }
    ]);

    // Records for Preethi Nair
    await Record.insertMany([
      {
        patientId: jane._id, doctorId: amit._id, hospital: "AIIMS",
        type: "Prescription", title: "Type 2 Diabetes Management",
        date: new Date("2022-08-12"),
        aiSummary: "HbA1c: 7.8%. Prescribed Metformin 500mg BD. Penicillin allergy noted.",
        category: "chronic"
      },
      {
        patientId: jane._id, doctorId: rajesh._id, hospital: "Apollo Diagnostics",
        type: "Lab Report", title: "Lipid Profile - Annual Screening",
        date: new Date("2024-03-30"),
        aiSummary: "LDL elevated at 142 mg/dL. Statin therapy initiated.",
        category: "chronic"
      }
    ]);

    console.log("\n✅ Seed data inserted successfully!");
    console.log("\n📋 DEMO CREDENTIALS:");
    console.log("  Citizen:    123456789012 / password");
    console.log("  Doctor:     DOC001 / password");
    console.log("  Diagnostic: DOC002 / password");
    console.log("  Admin:      admin@medtrace.com / password");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
