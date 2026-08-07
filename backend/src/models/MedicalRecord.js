const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  hospitalName: { type: String },
  doctorName: { type: String },
  doctorSpecialization: { type: String },
  // Record type
  type: {
    type: String,
    enum: ['scan', 'lab_report', 'prescription', 'consultation', 'vaccination'],
    required: true,
  },
  // Scan-specific
  scanType: { type: String }, // MRI, CT, X-Ray, Ultrasound
  bodyPart: { type: String },
  dicomFilePath: { type: String },
  dicomFileUrl: { type: String },
  // Report
  reportTitle: { type: String, required: true },
  reportText: { type: String }, // Extracted OCR text or typed report
  reportFilePath: { type: String },
  reportFileUrl: { type: String },
  // AI Summary
  aiSummary: {
    criticalAlerts: [String],
    chronicConditions: [String],
    minorHistory: [String],
    snapshot: String,
    generatedAt: Date,
  },
  // Doctor notes
  consultationNotes: { type: String },
  // Sensitivity flags
  isSensitive: { type: Boolean, default: false }, // Mental health, STDs etc.
  sensitiveCategory: {
    type: String,
    enum: ['mental_health', 'std', 'hiv', 'reproductive', 'substance_abuse', null],
    default: null,
  },
  isVisible: { type: Boolean, default: true },
  recordDate: { type: Date, default: Date.now },
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MedicalRecordSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for fast patient queries
MedicalRecordSchema.index({ patientId: 1, recordDate: -1 });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
