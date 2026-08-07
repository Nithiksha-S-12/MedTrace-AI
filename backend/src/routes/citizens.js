const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { generateAISummary } = require('../services/aiService');
const { MOCK_DATA } = require('./mockDataStore');

const router = express.Router();

// GET /api/citizens/profile — Get own profile
router.get('/profile', authenticate, requireRole('citizen'), (req, res) => {
  const citizen = MOCK_DATA.citizens.find(c => c.mockUserId === req.user.id);
  if (!citizen) {
    // Return from JWT token data
    return res.json({
      citizen: {
        id: req.user.id,
        fullName: req.user.name,
        email: req.user.email,
        healthId: req.user.healthId || 'HID-A7X2K',
        governmentId: req.user.governmentId || 'GOV123456789',
        phone: '+91-9876543210',
        dateOfBirth: '1970-03-15',
        gender: 'Male',
        bloodGroup: 'B+',
        address: '45, Nehru Nagar, New Delhi - 110001',
        emergencyContact: { name: 'Sunita Kumar', phone: '+91-9988776655', relationship: 'Spouse' },
        isVerified: true,
        createdAt: '2020-01-15',
      }
    });
  }
  res.json({ citizen });
});

// GET /api/citizens/records — Get own medical records
router.get('/records', authenticate, requireRole('citizen'), (req, res) => {
  const { type, search, page = 1, limit = 20 } = req.query;
  let records = [...MOCK_DATA.records];

  if (type && type !== 'all') {
    records = records.filter(r => r.type === type);
  }

  if (search) {
    const s = search.toLowerCase();
    records = records.filter(
      r =>
        r.reportTitle.toLowerCase().includes(s) ||
        r.hospitalName.toLowerCase().includes(s) ||
        r.doctorName.toLowerCase().includes(s)
    );
  }

  // Sort newest first
  records.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

  const total = records.length;
  const paginated = records.slice((page - 1) * limit, page * limit);

  res.json({ records: paginated, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/citizens/records/:id — Get single record
router.get('/records/:id', authenticate, requireRole('citizen', 'doctor', 'admin'), (req, res) => {
  const record = MOCK_DATA.records.find(r => r._id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  res.json({ record });
});

// GET /api/citizens/ai-summary — Get AI triage summary
router.get('/ai-summary', authenticate, requireRole('citizen', 'doctor', 'admin'), async (req, res) => {
  try {
    const summary = await generateAISummary(MOCK_DATA.records);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'AI summary generation failed' });
  }
});

// GET /api/citizens/notifications — Get notifications
router.get('/notifications', authenticate, requireRole('citizen'), (req, res) => {
  res.json({ notifications: MOCK_DATA.notifications });
});

// GET /api/citizens/stats — Get dashboard stats
router.get('/stats', authenticate, requireRole('citizen'), (req, res) => {
  const records = MOCK_DATA.records;
  res.json({
    stats: {
      totalReports: records.length,
      totalScans: records.filter(r => r.type === 'scan').length,
      totalLabs: records.filter(r => r.type === 'lab_report').length,
      verifiedDoctors: MOCK_DATA.doctors.filter(d => d.status === 'approved').length,
      lastUpdated: records[0]?.recordDate || new Date(),
    }
  });
});

// GET /api/citizens/search — Admin/Doctor searches a citizen
router.get('/search', authenticate, requireRole('doctor', 'diagnostic', 'admin'), (req, res) => {
  const { governmentId, name, healthId } = req.query;
  let result = MOCK_DATA.citizens;

  if (governmentId) {
    result = result.filter(c => c.governmentId.toLowerCase().includes(governmentId.toLowerCase()));
  }
  if (name) {
    result = result.filter(c => c.fullName.toLowerCase().includes(name.toLowerCase()));
  }
  if (healthId) {
    result = result.filter(c => c.healthId.toLowerCase().includes(healthId.toLowerCase()));
  }

  res.json({ citizens: result.map(c => ({ ...c, phone: '***-****-' + c.phone.slice(-4) })) });
});

// POST /api/citizens/register — Register new citizen
router.post('/register', (req, res) => {
  const { governmentId, fullName, dateOfBirth, phone, email } = req.body;

  // Check duplicate government ID
  const existing = MOCK_DATA.citizens.find(c => c.governmentId === governmentId?.toUpperCase());
  if (existing) {
    return res.status(409).json({
      error: 'Account already exists. Please login.',
      code: 'DUPLICATE_GOVERNMENT_ID',
    });
  }

  // In mock mode, just return success
  const { generateHealthId } = require('../utils/healthIdGenerator');
  const healthId = generateHealthId();

  res.status(201).json({
    success: true,
    message: 'Registration successful! Your Health ID has been created.',
    healthId,
    governmentId: governmentId?.toUpperCase(),
  });
});

module.exports = router;
