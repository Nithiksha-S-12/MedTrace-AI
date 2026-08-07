const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique Health ID in format HID-XXXXX
 * XXXXX is alphanumeric uppercase
 */
const generateHealthId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'HID-';
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

/**
 * Generate secure QR session token
 */
const generateSessionToken = () => {
  return uuidv4().replace(/-/g, '').toUpperCase();
};

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Format date to Indian standard
 */
const formatIndianDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

module.exports = { generateHealthId, generateSessionToken, generateOTP, formatIndianDate };
