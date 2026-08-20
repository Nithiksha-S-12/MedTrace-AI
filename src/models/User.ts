import mongoose, { Schema, Document } from "mongoose";

export type Role = "citizen" | "doctor" | "diagnostic" | "admin";

export interface IUser extends Document {
  govId?: string; // For citizens (Aadhaar)
  healthId?: string; // Generated for citizens (e.g. HID-XXXXX)
  licenseNumber?: string; // For doctors (legacy, kept for compatibility if used)
  registrationNumber?: string; // Doctor / Scan Centre registration number
  licenseProof?: string; // URL/Path to state medical council proof
  hospitalId?: string; // URL/Path to hospital ID card
  experience?: number; // Years of experience
  centreLicense?: string; // Scan Centre license number
  centreName?: string; // Scan Centre name
  address?: string; // Scan Centre address
  status?: "pending" | "approved" | "rejected"; // Admin approval status
  name: string;
  role: Role;
  password?: string; // Hashed in a real app, plaintext for demo
  resetToken?: string;
  resetTokenExpiry?: Date;
  dob?: string;
  phone?: string;
  email?: string;
  fingerprint?: string; // Hashed biometric fingerprint data
  hospital?: string; // For diagnostic/doctors
  specialization?: string;
  isVerified: boolean;
  medicalHistory?: string;
  aiSummary?: {
    criticalAlerts?: string;
    chronicConditions?: string;
    minorHistory?: string;
    summary?: string;
    updatedAt?: Date;
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    govId: { type: String, unique: true, sparse: true }, // Aadhaar
    healthId: { type: String, unique: true, sparse: true },
    licenseNumber: { type: String, unique: true, sparse: true },
    registrationNumber: { type: String, unique: true, sparse: true },
    licenseProof: { type: String },
    hospitalId: { type: String },
    experience: { type: Number },
    centreLicense: { type: String, unique: true, sparse: true },
    centreName: { type: String },
    address: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    name: { type: String, required: true },
    role: { type: String, enum: ["citizen", "doctor", "diagnostic", "admin"], required: true },
    password: { type: String }, // In real app, must be hashed
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    dob: { type: String },
    phone: { type: String, unique: true, sparse: true }, // Ensure phone is unique
    email: { type: String, unique: true, sparse: true }, // Ensure email is unique
    fingerprint: { type: String, sparse: true },
    hospital: { type: String },
    specialization: { type: String },
    isVerified: { type: Boolean, default: false },
    medicalHistory: { type: String },
    aiSummary: {
      criticalAlerts: { type: String },
      chronicConditions: { type: String },
      minorHistory: { type: String },
      summary: { type: String },
      updatedAt: { type: Date },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { strict: false }
);

if (mongoose.models.User && !mongoose.models.User.schema.path("aiSummary")) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
