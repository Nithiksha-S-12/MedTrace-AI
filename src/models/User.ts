import mongoose, { Schema, Document } from "mongoose";

export type Role = "citizen" | "doctor" | "diagnostic" | "admin";

export interface IUser extends Document {
  govId?: string; // For citizens
  healthId?: string; // Generated for citizens (e.g. HID-XXXXX)
  licenseNumber?: string; // For doctors
  name: string;
  role: Role;
  password?: string; // Hashed in a real app, plaintext for demo
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
    govId: { type: String, unique: true, sparse: true },
    healthId: { type: String, unique: true, sparse: true },
    licenseNumber: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["citizen", "doctor", "diagnostic", "admin"], required: true },
    password: { type: String }, // In real app, must be hashed
    dob: { type: String },
    phone: { type: String },
    email: { type: String },
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
