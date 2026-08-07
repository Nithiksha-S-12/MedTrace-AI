const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { MOCK_DATA } = require('./mockDataStore');
const { notifyEmergencyAccess } = require('../services/notificationService');

const router = express.Router();

const VALID_REASONS = ['Car Accident', 'Unconscious', 'Cardiac Arrest', 'Stroke', 'Trauma', 'Other'];

// POST /api/emergency/request — Doctor initiates emergency break-glass
router.post('/request', authenticate, requireRole('doctor', 'diagnostic'), async (req, res) => {
  const { patientGovernmentId, patientDob, reason, reasonDetails, confirmed } = req.body;

  if (!confirmed) {
    return res.status(400).json({ error: 'Must confirm this is a genuine emergency' });
  }
  if (!VALID_REASONS.includes(reason)) {
    return res.status(400).json({ error: 'Invalid emergency reason' });
  }
  if (!patientGovernmentId || !patientDob) {
    return res.status(400).json({ error: 'Patient Government ID and Date of Birth are required' });
  }

  // Find patient
  const patient = MOCK_DATA.citizens.find(
    c => c.governmentId === patientGovernmentId.toUpperCase()
  );
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found. Verify the Government ID.' });
  }

  // Verify DOB (loose check for demo)
  const inputDob = new Date(patientDob).toISOString().split('T')[0];
  const patientDobStr = new Date(patient.dateOfBirth).toISOString().split('T')[0];
  if (inputDob !== patientDobStr) {
    return res.status(401).json({ error: 'Date of birth does not match patient records.' });
  }

  // Create emergency access (15 minutes)
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

  const emergencyAccess = {
    _id: `emergency_${Date.now()}`,
    doctorId: req.user.id,
    doctorName: req.user.name,
    hospitalName: req.user.hospitalName || 'AIIMS New Delhi',
    patientId: patient._id,
    patientGovernmentId: patient.governmentId,
    reason,
    reasonDetails,
    confirmedAt: now.toISOString(),
    accessGrantedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true,
    patientAlertSent: false,
  };

  MOCK_DATA.emergencyAccesses.push(emergencyAccess);

  // Log audit entry
  MOCK_DATA.auditLogs.unshift({
    _id: `audit_${Date.now()}`,
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'EMERGENCY_ACCESS_GRANT',
    targetPatientId: patient._id,
    targetPatientName: patient.fullName,
    details: `Emergency override granted. Reason: ${reason}. Access expires at ${expiresAt.toLocaleString('en-IN')}.`,
    isEmergency: true,
    isFlagged: false,
    timestamp: now.toISOString(),
  });

  // Notify patient (async — don't block response)
  notifyEmergencyAccess(patient, { fullName: req.user.name, hospitalName: req.user.hospitalName }, reason)
    .then(() => {
      emergencyAccess.patientAlertSent = true;
    })
    .catch(console.error);

  // Return ONLY critical data (no mental health, STDs, etc.)
  const criticalRecords = MOCK_DATA.records.filter(
    r =>
      (r.patientId === patient._id || true) && // demo: return all records
      !r.isSensitive
  );

  res.json({
    success: true,
    message: 'Emergency access granted. Patient has been notified via SMS and Email.',
    emergencyAccessId: emergencyAccess._id,
    expiresAt: expiresAt.toISOString(),
    expiresInMinutes: 15,
    patient: {
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      bloodGroup: patient.bloodGroup,
      healthId: patient.healthId,
      emergencyContact: patient.emergencyContact,
    },
    // Only non-sensitive critical records
    records: criticalRecords,
    restrictions: {
      cannotSee: ['Mental Health Records', 'STD/HIV Status', 'Substance Abuse History', 'Reproductive Health'],
      canSee: ['Allergies', 'Blood Type', 'Chronic Conditions', 'Critical Medications', 'Recent Scans'],
    },
  });
});

// GET /api/emergency/active — Get active emergency session for a doctor
router.get('/active', authenticate, requireRole('doctor', 'diagnostic'), (req, res) => {
  const active = MOCK_DATA.emergencyAccesses.find(
    e => e.doctorId === req.user.id && e.isActive && new Date(e.expiresAt) > new Date()
  );
  res.json({ activeSession: active || null });
});

// POST /api/emergency/:id/expire — Manually expire emergency session
router.post('/:id/expire', authenticate, requireRole('doctor', 'diagnostic', 'admin'), (req, res) => {
  const session = MOCK_DATA.emergencyAccesses.find(e => e._id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.isActive = false;
  session.isExpired = true;
  session.expiredAt = new Date().toISOString();

  MOCK_DATA.auditLogs.unshift({
    _id: `audit_${Date.now()}`,
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'EMERGENCY_ACCESS_EXPIRE',
    targetPatientId: session.patientId,
    targetPatientName: 'Arjun Kumar',
    details: 'Emergency access session expired/terminated',
    isEmergency: true,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Emergency access revoked' });
});

module.exports = router;
