const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CitizenSchema = new mongoose.Schema({
  governmentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  healthId: {
    type: String,
    unique: true,
    default: () => `HID-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
  },
  fullName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  address: { type: String },
  clerkUserId: { type: String, unique: true, sparse: true },
  // Mock auth reference
  mockUserId: { type: String, unique: true, sparse: true },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CitizenSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Citizen', CitizenSchema);
