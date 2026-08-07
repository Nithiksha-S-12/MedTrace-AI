const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  clerkUserId: { type: String, unique: true, sparse: true },
  mockUserId: { type: String, unique: true, sparse: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String },
  medicalLicenseNumber: { type: String, required: true, unique: true, trim: true },
  specialization: { type: String },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  hospitalName: { type: String },
  hospitalAddress: { type: String },
  department: { type: String },
  // Document uploads (file paths or URLs)
  licenseDocumentPath: { type: String },
  hospitalIdDocumentPath: { type: String },
  // Verification status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  verifiedAt: { type: Date },
  rejectionReason: { type: String },
  // Emergency access count
  unauthorizedAccessFlags: { type: Number, default: 0 },
  isPermanentlyRevoked: { type: Boolean, default: false },
  role: { type: String, default: 'doctor' },
  isDiagnosticCenter: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

DoctorSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Doctor', DoctorSchema);
