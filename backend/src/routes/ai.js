const express = require('express');
const { authenticate } = require('../middleware/auth');
const { generateAISummary } = require('../services/aiService');
const { MOCK_DATA } = require('./mockDataStore');

const router = express.Router();

// POST /api/ai/summarize — Generate AI triage summary
router.post('/summarize', authenticate, async (req, res) => {
  try {
    const { patientId, records: providedRecords } = req.body;

    const records = providedRecords || MOCK_DATA.records.filter(
      r => !patientId || r.patientId === patientId
    );

    const summary = await generateAISummary(records);

    // Log AI usage
    MOCK_DATA.auditLogs.unshift({
      _id: `audit_${Date.now()}`,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'AI_SUMMARY_GENERATE',
      details: `AI triage summary generated for ${records.length} records`,
      isEmergency: false,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ error: 'AI summarization failed: ' + err.message });
  }
});

// GET /api/ai/summary/:patientId — Quick GET endpoint
router.get('/summary/:patientId', authenticate, async (req, res) => {
  try {
    const records = MOCK_DATA.records.filter(
      r => r.patientId === req.params.patientId
    );
    const summary = await generateAISummary(records);
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
