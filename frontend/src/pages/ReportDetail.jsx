import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import { toast } from 'react-toastify';

const MOCK_RECORDS = {
  record_001: {
    _id: 'record_001', type: 'scan', scanType: 'MRI', bodyPart: 'Brain',
    reportTitle: 'MRI Brain — Routine Checkup',
    hospitalName: 'Apollo Diagnostics Center',
    doctorName: 'Dr. Rajesh Mehta', doctorSpecialization: 'Radiology',
    recordDate: '2024-11-15',
    reportText: 'MRI of the brain with and without contrast. The brain parenchyma appears normal. No acute infarction, hemorrhage, or mass lesion. Ventricles and sulci are normal in size and configuration. No abnormal enhancement noted.\n\nIMPRESSION: Normal MRI Brain.',
    aiSummary: {
      criticalAlerts: ['Allergy: Penicillin (Anaphylaxis)', 'Warfarin 5mg (Blood thinner)'],
      chronicConditions: ['Type 2 Diabetes (HbA1c 7.8%)', 'Hypertension Stage 2'],
      minorHistory: ['URTI Jan 2023', 'Gastritis Mar 2022'],
      snapshot: '55yo male with T2DM, HTN. Allergic to Penicillin. On Warfarin. Normal brain MRI.',
    },
    consultationNotes: 'No abnormality detected in MRI. Continue routine monitoring.',
  },
  record_002: {
    _id: 'record_002', type: 'lab_report',
    reportTitle: 'Complete Blood Count + HbA1c Panel',
    hospitalName: 'AIIMS New Delhi',
    doctorName: 'Dr. Priya Sharma', doctorSpecialization: 'Internal Medicine',
    recordDate: '2024-09-20',
    reportText: 'CBC: WBC 7.2 x10³/µL (Normal), RBC 4.5 x10⁶/µL (Normal), Hemoglobin 13.8 g/dL (Normal), Platelets 245 x10³/µL (Normal).\nHbA1c: 7.8% (Target <7.0% for T2DM — Suboptimal)\nFasting Glucose: 145 mg/dL (High)\nLipid Panel: LDL 128 mg/dL, HDL 42 mg/dL\n\nIMPRESSION: Suboptimal glycemic control. Medication review recommended.',
  },
};

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = MOCK_RECORDS[id] || MOCK_RECORDS.record_001;

  const handleDownload = () => {
    toast.success('PDF download started!');
    // In production: use jsPDF to generate PDF
    const content = `MEDTRACE AI — GOVERNMENT HEALTH PASSPORT\n\n${record.reportTitle}\nDate: ${record.recordDate}\nHospital: ${record.hospitalName}\nDoctor: ${record.doctorName}\n\n${record.reportText}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${record.reportTitle.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  const typeIcons = { scan: '🔬', lab_report: '🧪', prescription: '💊', consultation: '🩺' };

  return (
    <PageLayout>
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-navy-800 hover:underline mb-4 font-medium">
        ← Back to Timeline
      </button>

      {/* Header Card */}
      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-navy-50 flex items-center justify-center text-3xl flex-shrink-0">
              {typeIcons[record.type] || '📄'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">{record.reportTitle}</h1>
              <p className="text-sm text-gray-500 mt-1">
                🏥 {record.hospitalName} &nbsp;•&nbsp; 👨‍⚕️ {record.doctorName}
                {record.doctorSpecialization && ` (${record.doctorSpecialization})`}
              </p>
              <p className="text-sm text-gray-500">
                📅 {new Date(record.recordDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                {record.scanType && <> &nbsp;•&nbsp; 🔬 {record.scanType}{record.bodyPart && ` — ${record.bodyPart}`}</>}
              </p>
            </div>
          </div>
          <button onClick={handleDownload} className="btn-secondary text-sm flex-shrink-0">
            ⬇️ Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Report Text */}
        <div className="card p-5">
          <h3 className="section-title">Report Content</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
              {record.reportText || 'Report text not available.'}
            </pre>
          </div>
          {record.consultationNotes && (
            <div className="mt-4">
              <h4 className="text-sm font-bold text-navy-800 mb-2">Doctor's Notes</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 italic">{record.consultationNotes}</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {record.aiSummary && (
          <div className="card p-5">
            <h3 className="section-title">AI Summary</h3>
            {record.aiSummary.criticalAlerts?.length > 0 && (
              <div className="alert-critical mb-3">
                <p className="text-xs font-bold text-red-800 mb-1">🔴 Critical Alerts</p>
                {record.aiSummary.criticalAlerts.map((a, i) => <p key={i} className="text-sm text-red-700">⚠ {a}</p>)}
              </div>
            )}
            {record.aiSummary.chronicConditions?.length > 0 && (
              <div className="alert-warning mb-3">
                <p className="text-xs font-bold text-amber-800 mb-1">🟠 Chronic Conditions</p>
                {record.aiSummary.chronicConditions.map((c, i) => <p key={i} className="text-sm text-amber-700">● {c}</p>)}
              </div>
            )}
            {record.aiSummary.snapshot && (
              <div className="mt-3 p-3 bg-navy-50 rounded-lg border border-navy-200">
                <p className="text-xs font-bold text-navy-800 mb-1">📄 ER Snapshot</p>
                <p className="text-sm text-navy-700 italic">"{record.aiSummary.snapshot}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
