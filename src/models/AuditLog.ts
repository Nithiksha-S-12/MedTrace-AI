import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  performedBy: mongoose.Types.ObjectId;
  role: string;
  action: string;
  patientId?: mongoose.Types.ObjectId;
  details?: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: true },
  action: { type: String, required: true },
  patientId: { type: Schema.Types.ObjectId, ref: "User" },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
