const mongoose = require('mongoose');

const QRSessionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
  sessionToken: { type: String, required: true, unique: true },
  encryptedToken: { type: String, required: true },
  sharingLevel: {
    type: String,
    enum: ['emergency_only', 'full_timeline', 'custom'],
    required: true,
  },
  customRecordIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }],
  duration: { type: Number, required: true }, // minutes
  expiresAt: { type: Date, required: true },
  // OTP for two-factor consent
  otpCode: { type: String },
  otpExpires: { type: Date },
  otpVerified: { type: Boolean, default: false },
  // State
  isUsed: { type: Boolean, default: false },
  isRevoked: { type: Boolean, default: false },
  revokedAt: { type: Date },
  // Doctor who scanned
  scannedByDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  scannedByDoctorName: { type: String },
  scannedAt: { type: Date },
  // Session viewing window (after OTP approval)
  sessionStartedAt: { type: Date },
  sessionExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Auto-expire index
QRSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('QRSession', QRSessionSchema);
