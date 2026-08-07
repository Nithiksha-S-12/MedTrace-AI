const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { MOCK_DATA } = require('./mockDataStore');

const router = express.Router();

// GET /api/hospitals — List approved hospitals
router.get('/', authenticate, (req, res) => {
  const hospitals = MOCK_DATA.hospitals.filter(h => h.status === 'approved');
  res.json({ hospitals });
});

// POST /api/hospitals/register
router.post('/register', (req, res) => {
  const { registrationNumber, name, type, address, contactPhone, contactEmail } = req.body;

  if (!registrationNumber || !name || !address) {
    return res.status(400).json({ error: 'Registration number, name, and address are required' });
  }

  const existing = MOCK_DATA.hospitals.find(h => h.registrationNumber === registrationNumber);
  if (existing) {
    return res.status(409).json({ error: 'Hospital already registered with this registration number' });
  }

  res.status(201).json({
    success: true,
    message: 'Hospital registration submitted. Pending admin verification.',
    status: 'pending',
  });
});

module.exports = router;
