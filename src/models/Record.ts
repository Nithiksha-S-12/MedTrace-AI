import mongoose, { Schema, Document } from "mongoose";

export interface IRecord extends Document {
  patientId: mongoose.Types.ObjectId; // Reference to citizen User
  type: string; // e.g., "MRI Scan", "Lab Report", "Prescription"
  title: string;
  date: Date;
  doctorId: mongoose.Types.ObjectId; // Reference to uploading doctor
  hospital: string;
  fileUrl?: string; // base64 or cloudinary url
  aiSummary?: string; // AI generated summary text
  category?: "minor" | "chronic" | "critical"; // Categorized by AI
  createdAt: Date;
}

const RecordSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  hospital: { type: String, required: true },
  fileUrl: { type: String },
  aiSummary: { type: String },
  category: { type: String, enum: ["minor", "chronic", "critical"] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Record || mongoose.model<IRecord>("Record", RecordSchema);
