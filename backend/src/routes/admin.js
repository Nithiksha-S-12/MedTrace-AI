const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { MOCK_DATA } = require('./mockDataStore');

const router = express.Router();

// GET /api/admin/stats — System-wide stats
router.get('/stats', authenticate, requireRole('admin'), (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  res.json({
    stats: {
      totalCitizens: MOCK_DATA.citizens.length,
      totalDoctors: MOCK_DATA.doctors.length,
      totalHospitals: MOCK_DATA.hospitals.length,
      pendingDoctorApprovals: MOCK_DATA.doctors.filter(d => d.status === 'pending').length,
      pendingHospitalApprovals: MOCK_DATA.hospitals.filter(h => h.status === 'pending').length,
      emergencyOverridesToday: MOCK_DATA.auditLogs.filter(
        l => l.isEmergency && l.timestamp.startsWith(today)
      ).length,
      totalAuditLogs: MOCK_DATA.auditLogs.length,
    }
  });
});

// GET /api/admin/citizens — List all citizens
router.get('/citizens', authenticate, requireRole('admin'), (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  let citizens = [...MOCK_DATA.citizens];

  if (search) {
    const s = search.toLowerCase();
    citizens = citizens.filter(
      c =>
        c.fullName.toLowerCase().includes(s) ||
        c.governmentId.toLowerCase().includes(s) ||
        c.healthId.toLowerCase().includes(s)
    );
  }

  res.json({ citizens, total: citizens.length });
});

// POST /api/admin/citizens/:id/block
router.post('/citizens/:id/block', authenticate, requireRole('admin'), (req, res) => {
  const citizen = MOCK_DATA.citizens.find(c => c._id === req.params.id);
  if (!citizen) return res.status(404).json({ error: 'Citizen not found' });
  citizen.isBlocked = !citizen.isBlocked;

  MOCK_DATA.auditLogs.unshift({
    _id: `audit_${Date.now()}`,
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'CITIZEN_BLOCK',
    targetPatientId: citizen._id,
    targetPatientName: citizen.fullName,
    details: `Account ${citizen.isBlocked ? 'blocked' : 'unblocked'}`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, isBlocked: citizen.isBlocked });
});

// GET /api/admin/doctors — List all doctors
router.get('/doctors', authenticate, requireRole('admin'), (req, res) => {
  const { status, search } = req.query;
  let doctors = [...MOCK_DATA.doctors];

  if (status && status !== 'all') {
    doctors = doctors.filter(d => d.status === status);
  }
  if (search) {
    const s = search.toLowerCase();
    doctors = doctors.filter(
      d => d.fullName.toLowerCase().includes(s) || d.medicalLicenseNumber.toLowerCase().includes(s)
    );
  }

  res.json({ doctors, total: doctors.length });
});

// POST /api/admin/doctors/:id/approve
router.post('/doctors/:id/approve', authenticate, requireRole('admin'), (req, res) => {
  const doctor = MOCK_DATA.doctors.find(d => d._id === req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  doctor.status = 'approved';
  doctor.verifiedAt = new Date().toISOString();
  doctor.verifiedBy = req.user.id;

  MOCK_DATA.auditLogs.unshift({
    _id: `audit_${Date.now()}`,
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'DOCTOR_APPROVE',
    details: `Approved Dr. ${doctor.fullName} — License: ${doctor.medicalLicenseNumber}`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: `Dr. ${doctor.fullName} has been approved.` });
});

// POST /api/admin/doctors/:id/reject
router.post('/doctors/:id/reject', authenticate, requireRole('admin'), (req, res) => {
  const doctor = MOCK_DATA.doctors.find(d => d._id === req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  doctor.status = 'rejected';
  doctor.rejectionReason = req.body.reason || 'Application rejected by administrator';

  MOCK_DATA.auditLogs.unshift({
    _id: `audit_${Date.now()}`,
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'DOCTOR_REJECT',
    details: `Rejected Dr. ${doctor.fullName}. Reason: ${doctor.rejectionReason}`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: `Application rejected.` });
});

// POST /api/admin/doctors/:id/suspend
router.post('/doctors/:id/suspend', authenticate, requireRole('admin'), (req, res) => {
  const doctor = MOCK_DATA.doctors.find(d => d._id === req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  doctor.status = doctor.status === 'suspended' ? 'approved' : 'suspended';

  res.json({ success: true, status: doctor.status });
});

// GET /api/admin/hospitals — List all hospitals
router.get('/hospitals', authenticate, requireRole('admin'), (req, res) => {
  const { status } = req.query;
  let hospitals = [...MOCK_DATA.hospitals];
  if (status && status !== 'all') {
    hospitals = hospitals.filter(h => h.status === status);
  }
  res.json({ hospitals, total: hospitals.length });
});

// POST /api/admin/hospitals/:id/approve
router.post('/hospitals/:id/approve', authenticate, requireRole('admin'), (req, res) => {
  const hospital = MOCK_DATA.hospitals.find(h => h._id === req.params.id);
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
  hospital.status = 'approved';
  hospital.verifiedAt = new Date().toISOString();

  MOCK_DATA.auditLogs.unshift({
    _id: `audit_${Date.now()}`,
    actorId: req.user.id,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'HOSPITAL_APPROVE',
    details: `Approved hospital: ${hospital.name}`,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: `${hospital.name} has been approved.` });
});

// POST /api/admin/hospitals/:id/reject
router.post('/hospitals/:id/reject', authenticate, requireRole('admin'), (req, res) => {
  const hospital = MOCK_DATA.hospitals.find(h => h._id === req.params.id);
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
  hospital.status = 'rejected';
  hospital.rejectionReason = req.body.reason || 'Rejected by administrator';
  res.json({ success: true });
});

// GET /api/admin/audit-logs — System audit trail
router.get('/audit-logs', authenticate, requireRole('admin'), (req, res) => {
  const { action, isEmergency, startDate, endDate, page = 1, limit = 50 } = req.query;
  let logs = [...MOCK_DATA.auditLogs];

  if (action) logs = logs.filter(l => l.action === action);
  if (isEmergency !== undefined) logs = logs.filter(l => l.isEmergency === (isEmergency === 'true'));
  if (startDate) logs = logs.filter(l => new Date(l.timestamp) >= new Date(startDate));
  if (endDate) logs = logs.filter(l => new Date(l.timestamp) <= new Date(endDate));

  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = logs.length;
  const paginated = logs.slice((page - 1) * limit, page * limit);

  res.json({ logs: paginated, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// POST /api/admin/audit-logs/:id/flag
router.post('/audit-logs/:id/flag', authenticate, requireRole('admin'), (req, res) => {
  const log = MOCK_DATA.auditLogs.find(l => l._id === req.params.id);
  if (!log) return res.status(404).json({ error: 'Log not found' });
  log.isFlagged = true;
  log.flagReason = req.body.reason;
  res.json({ success: true });
});

module.exports = router;
