import React, { useState } from 'react';
import PageLayout from '../components/common/PageLayout';
import AISummaryCard from '../components/common/AISummaryCard';
import { useNavigate } from 'react-router-dom';

const MOCK_PATIENT = {
  fullName: 'Arjun Kumar', age: 54, dateOfBirth: '1970-03-15',
  bloodGroup: 'B+', healthId: 'HID-A7X2K', gender: 'Male',
};
const MOCK_AI = {
  criticalAlerts: ['Allergy: Penicillin (Severe — Anaphylaxis risk)', 'Medication: Warfarin 5mg (Blood thinner — bleeding risk)'],
  chronicConditions: ['Type 2 Diabetes Mellitus (HbA1c: 7.8%) — Active', 'Hypertension Stage 2 (BP: 150/95) — Controlled'],
  minorHistory: ['URTI — Jan 2023 (Resolved)', 'Gastritis — Mar 2022 (Resolved)'],
  snapshot: '55yo male with T2DM, HTN. Allergic to Penicillin (anaphylaxis). On Warfarin. No recent cardiac events.',
  generatedAt: new Date(),
};
const MOCK_RECORDS = [
  { _id: 'r1', type: 'scan', scanType: 'MRI', reportTitle: 'MRI Brain — Normal', hospitalName: 'Apollo Diagnostics', recordDate: '2024-11-15' },
  { _id: 'r2', type: 'lab_report', reportTitle: 'CBC + HbA1c Panel', hospitalName: 'AIIMS', recordDate: '2024-09-20' },
];

export default function DoctorPatientSummary() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleSaveNotes = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 3000);
  };

  return (
    <PageLayout>
      <button onClick={() => navigate('/doctor')} className="flex items-center gap-2 text-sm text-navy-800 hover:underline mb-4">← Back to Dashboard</button>

      {/* Patient Header */}
      <div className="card p-5 mb-5 border-l-4 border-forest-800">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-forest-800 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {MOCK_PATIENT.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-navy-900">{MOCK_PATIENT.fullName}</h1>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
              <span>Age: <strong>{MOCK_PATIENT.age}</strong></span>
              <span>DOB: <strong>{new Date(MOCK_PATIENT.dateOfBirth).toLocaleDateString('en-IN')}</strong></span>
              <span>🩸 Blood: <strong className="text-red-600">{MOCK_PATIENT.bloodGroup}</strong></span>
              <span>🪪 <strong className="text-gold-600">{MOCK_PATIENT.healthId}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        {/* Left: AI Summary */}
        <div className="card p-5">
          <h3 className="section-title">🧠 AI Emergency Snapshot</h3>
          <AISummaryCard summary={MOCK_AI} />
        </div>

        {/* Right: DICOM Viewer Placeholder */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title mb-0">🔬 Scan Viewer (DICOM)</h3>
            <select className="form-input w-auto text-xs py-1.5" onChange={e => setSelectedRecord(e.target.value)}>
              <option value="">Select Scan</option>
              {MOCK_RECORDS.filter(r => r.type === 'scan').map(r => (
                <option key={r._id} value={r._id}>{r.reportTitle}</option>
              ))}
            </select>
          </div>
          <div className="bg-black rounded-lg h-64 flex flex-col items-center justify-center text-gray-400">
            <span className="text-5xl mb-3">🏥</span>
            <p className="font-medium">DICOM Viewer</p>
            <p className="text-xs mt-1">Select a scan from the dropdown above</p>
            <p className="text-xs mt-1 text-gray-600">Supports: MRI, CT, X-Ray, Ultrasound</p>
            {selectedRecord && (
              <div className="mt-3 text-center">
                <p className="text-gray-300 text-xs">Loading: {MOCK_RECORDS.find(r => r._id === selectedRecord)?.reportTitle}</p>
                <div className="w-6 h-6 border-2 border-gray-400 border-t-white rounded-full animate-spin mx-auto mt-2" />
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {['🔍 Zoom', '↔ Pan', '⬆ Window', '⬇ Level'].map(t => (
              <button key={t} className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 py-1 rounded transition-colors">{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Medical Records */}
      <div className="card p-5 mb-5">
        <h3 className="section-title">Medical Records</h3>
        <div className="space-y-2">
          {MOCK_RECORDS.map(rec => (
            <div key={rec._id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <span className="text-xl">{rec.type === 'scan' ? '🔬' : '🧪'}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{rec.reportTitle}</p>
                <p className="text-xs text-gray-500">{rec.hospitalName}</p>
              </div>
              <p className="text-xs text-gray-400">{new Date(rec.recordDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Consultation Notes */}
      <div className="card p-5">
        <h3 className="section-title">Add Consultation Notes</h3>
        <textarea className="form-input h-28 resize-none mb-3" placeholder="Enter your consultation notes, observations, and treatment plan..."
          value={notes} onChange={e => setNotes(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={handleSaveNotes} className="btn-primary">
            {notesSaved ? '✓ Saved!' : '💾 Save Notes'}
          </button>
          <button onClick={() => window.print()} className="btn-secondary text-sm">⬇️ Download PDF</button>
        </div>
      </div>
    </PageLayout>
  );
}
