const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actorId: { type: String, required: true }, // userId (mongo id or mock)
  actorName: { type: String },
  actorRole: {
    type: String,
    enum: ['citizen', 'doctor', 'diagnostic', 'admin', 'system'],
    required: true,
  },
  action: {
    type: String,
    enum: [
      'LOGIN', 'LOGOUT', 'REGISTER',
      'RECORD_VIEW', 'RECORD_UPLOAD', 'RECORD_DOWNLOAD',
      'QR_GENERATE', 'QR_SCAN', 'QR_REVOKE', 'QR_EXPIRE',
      'EMERGENCY_ACCESS_REQUEST', 'EMERGENCY_ACCESS_GRANT', 'EMERGENCY_ACCESS_EXPIRE',
      'DOCTOR_APPROVE', 'DOCTOR_REJECT', 'DOCTOR_SUSPEND',
      'HOSPITAL_APPROVE', 'HOSPITAL_REJECT',
      'CITIZEN_BLOCK', 'CITIZEN_VERIFY',
      'AI_SUMMARY_GENERATE',
      'PROFILE_UPDATE',
      'ACCESS_REVOKE',
    ],
    required: true,
  },
  targetPatientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen' },
  targetPatientName: { type: String },
  targetRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' },
  details: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  isEmergency: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  timestamp: { type: Date, default: Date.now },
});

// Indexes for fast queries
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ actorId: 1, timestamp: -1 });
AuditLogSchema.index({ targetPatientId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ isEmergency: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
