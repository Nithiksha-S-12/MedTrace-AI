const mongoose = require('mongoose');

const EmergencyAccessSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String },
  doctorLicense: { type: String },
  hospitalName: { type: String },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
  patientGovernmentId: { type: String },
  patientDob: { type: Date },
  reason: {
    type: String,
    enum: ['Car Accident', 'Unconscious', 'Cardiac Arrest', 'Stroke', 'Trauma', 'Other'],
    required: true,
  },
  reasonDetails: { type: String },
  isConfirmed: { type: Boolean, default: false },
  confirmedAt: { type: Date },
  // Access window
  accessGrantedAt: { type: Date },
  expiresAt: { type: Date }, // confirmedAt + 15 minutes
  isActive: { type: Boolean, default: false },
  isExpired: { type: Boolean, default: false },
  expiredAt: { type: Date },
  // Alerts
  patientAlertSent: { type: Boolean, default: false },
  patientAlertSentAt: { type: Date },
  // What was accessed
  recordsViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }],
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
});

EmergencyAccessSchema.index({ expiresAt: 1 });
EmergencyAccessSchema.index({ doctorId: 1, createdAt: -1 });
EmergencyAccessSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('EmergencyAccess', EmergencyAccessSchema);
