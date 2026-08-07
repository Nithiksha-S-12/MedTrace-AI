const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['Government', 'Private', 'Diagnostic Center', 'Clinic'],
    default: 'Private',
  },
  address: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  // Document uploads
  registrationDocumentPath: { type: String },
  // Verification status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  verifiedAt: { type: Date },
  rejectionReason: { type: String },
  // Doctors linked to this hospital
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

HospitalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Hospital', HospitalSchema);
