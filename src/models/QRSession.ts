import mongoose, { Schema, Document } from "mongoose";

export interface IQRSession extends Document {
  sessionId: string;
  patientId: mongoose.Types.ObjectId;
  accessLevel: string;
  duration: number; // in minutes
  status: "active" | "accessed" | "revoked" | "expired";
  createdAt: Date;
  expiresAt: Date;
  isEmergency: boolean;
  accessedBy?: mongoose.Types.ObjectId;
}

const QRSessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  accessLevel: { type: String, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ["active", "accessed", "revoked", "expired"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isEmergency: { type: Boolean, default: false },
  accessedBy: { type: Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.models.QRSession || mongoose.model<IQRSession>("QRSession", QRSessionSchema);
