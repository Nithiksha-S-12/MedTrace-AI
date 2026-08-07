const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, requireRole } = require('../middleware/auth');
const { MOCK_DATA } = require('./mockDataStore');
const { notifyNewRecord } = require('../services/notificationService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.dcm', '.pdf', '.jpg', '.jpeg', '.png', '.tiff'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported`));
    }
  },
});

// POST /api/records/upload — Upload new medical record (diagnostic/doctor only)
router.post(
  '/upload',
  authenticate,
  requireRole('diagnostic', 'doctor'),
  upload.fields([
    { name: 'dicomFile', maxCount: 1 },
    { name: 'reportFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        patientGovernmentId,
        patientId,
        type,
        scanType,
        bodyPart,
        reportTitle,
        reportText,
        recordDate,
        confirmPatientIdentity,
      } = req.body;

      if (!confirmPatientIdentity || confirmPatientIdentity !== 'true') {
        return res.status(400).json({ error: 'Must confirm patient identity before uploading' });
      }

      // Verify patient exists
      const patient = MOCK_DATA.citizens.find(
        c => c.governmentId === patientGovernmentId?.toUpperCase() || c._id === patientId
      );
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found. Please verify the Government ID.' });
      }

      // Build new record
      const newRecord = {
        _id: `record_${Date.now()}`,
        patientId: patient._id,
        uploadedBy: req.user.id,
        hospitalName: req.user.hospitalName || 'Apollo Diagnostics Center',
        doctorName: req.user.name,
        doctorSpecialization: 'Radiology',
        type: type || 'scan',
        scanType,
        bodyPart,
        reportTitle,
        reportText,
        dicomFilePath: req.files?.dicomFile?.[0]?.path || null,
        reportFilePath: req.files?.reportFile?.[0]?.path || null,
        recordDate: recordDate || new Date().toISOString(),
        uploadedAt: new Date().toISOString(),
      };

      MOCK_DATA.records.unshift(newRecord);

      // Add audit log
      MOCK_DATA.auditLogs.unshift({
        _id: `audit_${Date.now()}`,
        actorId: req.user.id,
        actorName: req.user.name,
        actorRole: req.user.role,
        action: 'RECORD_UPLOAD',
        targetPatientId: patient._id,
        targetPatientName: patient.fullName,
        details: `Uploaded ${type} — ${reportTitle}`,
        isEmergency: false,
        timestamp: new Date().toISOString(),
      });

      // Notify patient
      await notifyNewRecord(patient, { fullName: req.user.name, hospitalName: req.user.hospitalName }, newRecord);

      res.status(201).json({
        success: true,
        message: 'Record uploaded successfully. Patient has been notified.',
        record: newRecord,
      });
    } catch (err) {
      console.error('[Upload Error]:', err);
      res.status(500).json({ error: err.message || 'Upload failed' });
    }
  }
);

// GET /api/records/uploads — Get uploads by diagnostic center
router.get('/uploads', authenticate, requireRole('diagnostic'), (req, res) => {
  const uploads = MOCK_DATA.records.filter(r => r.uploadedBy === req.user.id);
  res.json({ records: uploads, total: uploads.length });
});

// GET /api/records/:id — Get single record
router.get('/:id', authenticate, (req, res) => {
  const record = MOCK_DATA.records.find(r => r._id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  res.json({ record });
});

module.exports = router;
