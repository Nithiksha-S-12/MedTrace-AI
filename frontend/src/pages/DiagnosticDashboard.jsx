import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import StatsCard from '../components/common/StatsCard';

export default function DiagnosticDashboard() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="bg-gradient-to-r from-purple-800 to-purple-600 rounded-card p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-1">Diagnostic Center Portal 🏥</h2>
        <p className="text-purple-100 text-sm">Apollo Diagnostics Center (REG-12345) &nbsp;•&nbsp; Verified Node</p>
      </div>

      <div className="stats-grid stagger-children">
        <StatsCard icon="📤" label="Scans Uploaded Today" value="24" color="purple" />
        <StatsCard icon="🧪" label="Lab Reports" value="58" color="green" />
        <StatsCard icon="🔍" label="OCR Processed" value="45" color="blue" />
        <StatsCard icon="✅" label="Total Records" value="1,245" color="navy" sublabel="All time" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="card p-8 text-center flex flex-col items-center justify-center border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer group"
          onClick={() => navigate('/diagnostic/upload')}>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
            📤
          </div>
          <h3 className="text-xl font-bold text-purple-900 mb-2">Upload New Record</h3>
          <p className="text-sm text-purple-700 max-w-xs mx-auto">Upload DICOM scans, PDF reports, or use OCR to digitize physical lab results.</p>
        </div>

        <div className="space-y-4">
          <h3 className="section-title">Recent Uploads</h3>
          {[
            { id: 1, type: 'MRI Brain', patient: 'Arjun Kumar', date: 'Today, 10:45 AM' },
            { id: 2, type: 'CBC Panel', patient: 'Meera Patel', date: 'Today, 09:15 AM' },
            { id: 3, type: 'Chest X-Ray', patient: 'Suresh Reddy', date: 'Yesterday, 04:30 PM' },
          ].map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <span className="text-2xl">{r.type.includes('MRI') || r.type.includes('X-Ray') ? '🔬' : '🧪'}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-navy-900">{r.type}</p>
                <p className="text-xs text-gray-500">Patient: {r.patient}</p>
              </div>
              <span className="text-xs text-gray-400">{r.date}</span>
            </div>
          ))}
          <button onClick={() => navigate('/diagnostic/history')} className="btn-ghost w-full text-sm">View All History →</button>
        </div>
      </div>
    </PageLayout>
  );
}
