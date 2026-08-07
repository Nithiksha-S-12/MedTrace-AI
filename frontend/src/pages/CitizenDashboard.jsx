import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/common/PageLayout';
import StatsCard from '../components/common/StatsCard';
import AISummaryCard from '../components/common/AISummaryCard';
import api from '../services/api';

const mockStats = { totalReports: 6, totalScans: 3, totalLabs: 2, verifiedDoctors: 2, lastUpdated: '2024-11-15' };
const mockAI = {
  criticalAlerts: ['Allergy: Penicillin (Severe — Anaphylaxis risk)', 'Medication: Warfarin 5mg (Blood thinner)'],
  chronicConditions: ['Type 2 Diabetes Mellitus (HbA1c: 7.8%) — Active', 'Hypertension Stage 2 (BP: 150/95) — Controlled'],
  minorHistory: ['URTI — Jan 2023 (Resolved)', 'Gastritis — Mar 2022 (Resolved)'],
  snapshot: '55yo male with T2DM and Stage 2 HTN. Allergic to Penicillin (anaphylaxis). On Warfarin — bleeding risk. No recent cardiac events.',
  generatedAt: new Date(),
};
const mockRecords = [
  { _id: 'record_001', type: 'scan', scanType: 'MRI', bodyPart: 'Brain', reportTitle: 'MRI Brain — Routine Checkup', hospitalName: 'Apollo Diagnostics', doctorName: 'Dr. Rajesh Mehta', recordDate: '2024-11-15' },
  { _id: 'record_002', type: 'lab_report', reportTitle: 'CBC + HbA1c Panel', hospitalName: 'AIIMS New Delhi', doctorName: 'Dr. Priya Sharma', recordDate: '2024-09-20' },
  { _id: 'record_003', type: 'prescription', reportTitle: 'Prescription — HTN & Diabetes', hospitalName: 'AIIMS New Delhi', doctorName: 'Dr. Priya Sharma', recordDate: '2024-09-20' },
  { _id: 'record_004', type: 'scan', scanType: 'X-Ray', bodyPart: 'Chest', reportTitle: 'Chest X-Ray PA View', hospitalName: 'Apollo Diagnostics', doctorName: 'Dr. Rajesh Mehta', recordDate: '2024-06-10' },
  { _id: 'record_005', type: 'lab_report', reportTitle: 'Renal Function Test', hospitalName: 'AIIMS New Delhi', doctorName: 'Dr. Priya Sharma', recordDate: '2024-03-05' },
];

const typeIcons = { scan: '🔬', lab_report: '🧪', prescription: '💊', consultation: '🩺', vaccination: '💉' };
const typeBadge = { scan: 'badge-info', lab_report: 'badge-success', prescription: 'badge-warning', consultation: 'badge-gray' };

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(mockStats);
  const [aiSummary, setAiSummary] = useState(mockAI);
  const [recentRecords, setRecentRecords] = useState(mockRecords);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, aiRes, recRes] = await Promise.allSettled([
          api.get('/citizens/stats'),
          api.get('/citizens/ai-summary'),
          api.get('/citizens/records?limit=5'),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
        if (aiRes.status === 'fulfilled') setAiSummary(aiRes.value.data.summary);
        if (recRes.status === 'fulfilled') setRecentRecords(recRes.value.data.records);
      } catch {}
    };
    load();
  }, []);

  return (
    <PageLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-700 rounded-card p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
              <p className="text-navy-200 text-sm">Health Passport: <span className="text-gold-400 font-bold">{user?.healthId || 'HID-A7X2K'}</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => navigate('/citizen/qr')} className="bg-gold-500 text-navy-900 px-4 py-2 rounded-md font-bold text-sm hover:bg-gold-400 transition-colors">
                🔲 Share via QR
              </button>
              <button onClick={() => navigate('/citizen/ai-summary')} className="bg-white/10 border border-white/30 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-white/20 transition-colors">
                🧠 AI Summary
              </button>
            </div>
          </div>
          {/* View-Only Notice */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-md px-3 py-1.5 text-xs">
            <span>🔒</span>
            <span>Your records are <strong>view-only</strong>. Only verified doctors can upload or modify medical data.</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid stagger-children">
        <StatsCard icon="📋" label="Total Reports" value={stats.totalReports} color="navy" sublabel="All time" />
        <StatsCard icon="🔬" label="Scans / Imaging" value={stats.totalScans} color="purple" sublabel="MRI, CT, X-Ray" />
        <StatsCard icon="🧪" label="Lab Reports" value={stats.totalLabs} color="green" sublabel="Blood, urine, etc." />
        <StatsCard icon="✅" label="Verified Doctors" value={stats.verifiedDoctors} color="blue" sublabel="Accessed your records" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Timeline */}
        <div className="lg:col-span-3">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">Recent Medical Records</h3>
              <button onClick={() => navigate('/citizen/timeline')} className="text-sm text-navy-800 font-semibold hover:underline">
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {recentRecords.map((rec, i) => (
                <div key={rec._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                  onClick={() => navigate(`/citizen/report/${rec._id}`)}>
                  <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center text-lg flex-shrink-0">
                    {typeIcons[rec.type] || '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-navy-900 truncate">{rec.reportTitle}</p>
                      <span className={typeBadge[rec.type] || 'badge-gray'}>{rec.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs text-gray-500">{rec.hospitalName} • {rec.doctorName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{new Date(rec.recordDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Summary Preview */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">AI Health Summary</h3>
              <button onClick={() => navigate('/citizen/ai-summary')} className="text-sm text-navy-800 font-semibold hover:underline">
                Full view →
              </button>
            </div>
            <AISummaryCard summary={aiSummary} compact={true} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Full Timeline', icon: '📋', to: '/citizen/timeline', color: 'border-navy-300 hover:bg-navy-50' },
          { label: 'Generate QR', icon: '🔲', to: '/citizen/qr', color: 'border-green-300 hover:bg-green-50' },
          { label: 'Notifications', icon: '🔔', to: '/citizen/notifications', color: 'border-amber-300 hover:bg-amber-50' },
          { label: 'My Profile', icon: '👤', to: '/citizen/profile', color: 'border-purple-300 hover:bg-purple-50' },
        ].map((action) => (
          <button key={action.to} onClick={() => navigate(action.to)}
            className={`card p-4 flex flex-col items-center gap-2 text-center border-2 transition-all duration-200 hover:shadow-card-hover cursor-pointer ${action.color}`}>
            <span className="text-2xl">{action.icon}</span>
            <span className="text-xs font-semibold text-navy-800">{action.label}</span>
          </button>
        ))}
      </div>
    </PageLayout>
  );
}
