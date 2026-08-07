const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { MOCK_DATA } = require('./mockDataStore');

const router = express.Router();

// GET /api/doctors/profile — Get own profile
router.get('/profile', authenticate, requireRole('doctor', 'diagnostic'), (req, res) => {
  const doctor = MOCK_DATA.doctors.find(d => d.mockUserId === req.user.id);
  if (!doctor) {
    return res.json({
      doctor: {
        id: req.user.id,
        fullName: req.user.name,
        email: req.user.email,
        status: req.user.status || 'approved',
        isDiagnosticCenter: req.user.isDiagnosticCenter || false,
        medicalLicenseNumber: 'MCI-DL-2019-04521',
        specialization: 'Internal Medicine',
        hospitalName: 'AIIMS New Delhi',
        department: 'General Medicine',
      }
    });
  }
  res.json({ doctor });
});

// GET /api/doctors/stats
router.get('/stats', authenticate, requireRole('doctor', 'diagnostic'), (req, res) => {
  res.json({
    stats: {
      patientsSeenToday: 8,
      pendingQRScans: 2,
      emergencyRequestsThisMonth: 1,
      totalUploads: req.user.isDiagnosticCenter ? 47 : 0,
    }
  });
});

// GET /api/doctors/audit-log
router.get('/audit-log', authenticate, requireRole('doctor', 'diagnostic'), (req, res) => {
  const logs = MOCK_DATA.auditLogs.filter(l => l.actorId === req.user.id);
  res.json({ logs });
});

// POST /api/doctors/register
router.post('/register', (req, res) => {
  const { medicalLicenseNumber, fullName, email, hospitalName, department } = req.body;
  if (!medicalLicenseNumber || !fullName || !email) {
    return res.status(400).json({ error: 'Medical license number, full name, and email are required' });
  }
  // Check duplicate license
  const existing = MOCK_DATA.doctors.find(d => d.medicalLicenseNumber === medicalLicenseNumber);
  if (existing) {
    return res.status(409).json({ error: 'A doctor with this license number is already registered' });
  }

  res.status(201).json({
    success: true,
    message: 'Registration submitted. Status: Pending admin verification. You will be notified within 2-3 business days.',
    status: 'pending',
  });
});

// GET /api/doctors/patients/search
router.get('/patients/search', authenticate, requireRole('doctor', 'diagnostic'), (req, res) => {
  const { governmentId, name } = req.query;
  let results = MOCK_DATA.citizens;

  if (governmentId) {
    results = results.filter(c => c.governmentId.toLowerCase().includes(governmentId.toLowerCase()));
  }
  if (name) {
    results = results.filter(c => c.fullName.toLowerCase().includes(name.toLowerCase()));
  }

  res.json({ citizens: results });
});

// GET /api/doctors/patients/:patientId/records
router.get('/patients/:patientId/records', authenticate, requireRole('doctor', 'diagnostic'), (req, res) => {
  const { patientId } = req.params;
  const { emergencyOnly } = req.query;

  let records = MOCK_DATA.records.filter(r => r.patientId === patientId || patientId === 'citizen_001');

  if (emergencyOnly === 'true') {
    // Filter out sensitive records
    records = records.filter(r => !r.isSensitive && r.type !== 'mental_health');
  }

  records.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
  res.json({ records });
});

module.exports = router;
