const express = require('express');
const crypto = require('crypto');
const { authenticate, requireRole } = require('../middleware/auth');
const { MOCK_DATA } = require('./mockDataStore');
const { generateSessionToken, generateOTP } = require('../utils/healthIdGenerator');
const { notifyQRScanned } = require('../services/notificationService');

const router = express.Router();

// POST /api/qr/generate — Citizen generates QR code
router.post('/generate', authenticate, requireRole('citizen'), (req, res) => {
  const { sharingLevel, duration } = req.body;

  if (!sharingLevel || !duration) {
    return res.status(400).json({ error: 'Sharing level and duration are required' });
  }

  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + duration * 60 * 1000);
  const otp = generateOTP();

  const session = {
    _id: `qr_${Date.now()}`,
    patientId: req.user.id,
    patientName: req.user.name,
    sessionToken,
    sharingLevel,
    duration,
    expiresAt: expiresAt.toISOString(),
    otpCode: otp,
    otpExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    isUsed: false,
    isRevoked: false,
    createdAt: new Date().toISOString(),
  };

  MOCK_DATA.qrSessions.push(session);

  // Add audit log
  MOCK_DATA.auditLogs.unshift({
    _id: `audit_${Date.now()}`,
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: 'citizen',
    action: 'QR_GENERATE',
    targetPatientId: req.user.id,
    targetPatientName: req.user.name,
    details: `Generated QR — Level: ${sharingLevel} — Duration: ${duration} min`,
    isEmergency: false,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    sessionToken,
    expiresAt: expiresAt.toISOString(),
    sharingLevel,
    duration,
    // QR code data (token only — no medical data)
    qrData: JSON.stringify({ token: sessionToken, system: 'medtrace', v: 1 }),
  });
});

// GET /api/qr/sessions — Get citizen's active QR sessions
router.get('/sessions', authenticate, requireRole('citizen'), (req, res) => {
  const sessions = MOCK_DATA.qrSessions.filter(
    s => s.patientId === req.user.id && !s.isRevoked && new Date(s.expiresAt) > new Date()
  );
  res.json({ sessions });
});

// POST /api/qr/revoke/:token — Citizen revokes a QR session
router.post('/revoke/:token', authenticate, requireRole('citizen'), (req, res) => {
  const session = MOCK_DATA.qrSessions.find(
    s => s.sessionToken === req.params.token && s.patientId === req.user.id
  );
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.isRevoked = true;
  session.revokedAt = new Date().toISOString();

  MOCK_DATA.auditLogs.unshift({
    _id: `audit_${Date.now()}`,
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: 'citizen',
    action: 'QR_REVOKE',
    targetPatientId: req.user.id,
    targetPatientName: req.user.name,
    details: `Revoked QR session ${req.params.token.substring(0, 8)}...`,
    isEmergency: false,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Access revoked successfully' });
});

// POST /api/qr/scan — Doctor scans QR code
router.post('/scan', authenticate, requireRole('doctor', 'diagnostic'), async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  const session = MOCK_DATA.qrSessions.find(s => s.sessionToken === token);

  if (!session) return res.status(404).json({ error: 'Invalid QR code' });
  if (session.isRevoked) return res.status(403).json({ error: 'This QR code has been revoked by the patient' });
  if (new Date(session.expiresAt) < new Date()) return res.status(403).json({ error: 'QR code has expired' });

  // Mark as scanned
  session.scannedByDoctorId = req.user.id;
  session.scannedByDoctorName = req.user.name;
  session.scannedAt = new Date().toISOString();

  // Notify patient
  const patient = MOCK_DATA.citizens.find(c => c._id === session.patientId || c.mockUserId === session.patientId);
  if (patient) {
    await notifyQRScanned(patient, { fullName: req.user.name });
  }

  // Log
  MOCK_DATA.auditLogs.unshift({
    _id: `audit_${Date.now()}`,
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'QR_SCAN',
    targetPatientId: session.patientId,
    targetPatientName: session.patientName,
    details: `Scanned QR — Sharing level: ${session.sharingLevel}`,
    isEmergency: false,
    timestamp: new Date().toISOString(),
  });

  // Simulate OTP sent to patient
  console.log(`\n🔐 [OTP] Patient OTP for QR consent: ${session.otpCode}\n`);

  res.json({
    success: true,
    message: 'QR scanned. Patient OTP verification required.',
    sessionId: session._id,
    sharingLevel: session.sharingLevel,
    requiresOTP: true,
    // In demo: return OTP for testing
    demoOTP: session.otpCode,
  });
});

// POST /api/qr/verify-otp — Doctor submits patient OTP
router.post('/verify-otp', authenticate, requireRole('doctor', 'diagnostic'), (req, res) => {
  const { sessionId, otp } = req.body;

  const session = MOCK_DATA.qrSessions.find(s => s._id === sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (session.otpCode !== otp) {
    return res.status(401).json({ error: 'Invalid OTP. Patient consent not verified.' });
  }

  session.otpVerified = true;
  session.sessionStartedAt = new Date().toISOString();
  session.sessionExpiresAt = new Date(Date.now() + session.duration * 60 * 1000).toISOString();

  // Get patient records
  const patient = MOCK_DATA.citizens.find(c => c._id === session.patientId || c.mockUserId === session.patientId) || MOCK_DATA.citizens[0];
  let records = MOCK_DATA.records;

  if (session.sharingLevel === 'emergency_only') {
    records = records.filter(r => !r.isSensitive).slice(0, 3);
  }

  res.json({
    success: true,
    message: 'OTP verified. Access granted.',
    patient,
    records,
    sessionExpiresAt: session.sessionExpiresAt,
    sharingLevel: session.sharingLevel,
  });
});

module.exports = router;
