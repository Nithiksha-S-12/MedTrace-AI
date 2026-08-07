import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/common/PageLayout';
import StatsCard from '../components/common/StatsCard';

const RECENT_PATIENTS = [
  { id: 'citizen_001', name: 'Arjun Kumar', healthId: 'HID-A7X2K', lastSeen: '2024-11-20', condition: 'Type 2 DM, Hypertension' },
  { id: 'citizen_002', name: 'Meera Patel', healthId: 'HID-B3R9M', lastSeen: '2024-11-18', condition: 'Routine checkup' },
  { id: 'citizen_003', name: 'Suresh Reddy', healthId: 'HID-C5T7P', lastSeen: '2024-11-10', condition: 'Post-surgery follow-up' },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.status === 'pending') {
    return (
      <PageLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Verification Pending</h2>
          <p className="text-gray-600 mb-4">Your medical license and credentials are under review by the Ministry of Health administration team.</p>
          <div className="alert-warning text-left">
            <p className="text-sm font-bold text-amber-800">Status: Pending Admin Approval</p>
            <p className="text-sm text-amber-700 mt-1">You will receive an email notification once your account is approved (typically 2-3 business days).</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="bg-gradient-to-r from-forest-800 to-forest-700 rounded-card p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <h2 className="text-2xl font-bold mb-1 relative">Welcome, {user?.name?.split(' ')[0] || 'Doctor'}! 🩺</h2>
        <p className="text-green-100 text-sm relative">
          {user?.isDiagnosticCenter ? 'Head Radiologist' : 'Verified Medical Professional'} &nbsp;•&nbsp;
          {user?.hospitalName || 'AIIMS New Delhi'} &nbsp;•&nbsp;
          License: <span className="font-bold">{user?.licenseNumber || 'MCI-DL-2019-04521'}</span>
        </p>
      </div>

      <div className="stats-grid stagger-children">
        <StatsCard icon="👥" label="Patients Seen Today" value="8" color="green" />
        <StatsCard icon="🔲" label="Pending QR Scans" value="2" color="navy" />
        <StatsCard icon="🚨" label="Emergency Requests" value="1" color="red" sublabel="This month" />
        <StatsCard icon="📋" label="Total Consultations" value="142" color="blue" sublabel="All time" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button onClick={() => navigate('/doctor/qr-scan')}
          className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all cursor-pointer border-2 border-transparent hover:border-forest-800 group">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-green-200 transition-colors">📷</div>
          <div className="text-left">
            <p className="font-bold text-navy-900">Scan QR Code</p>
            <p className="text-xs text-gray-500">Access patient records</p>
          </div>
        </button>
        <button onClick={() => navigate('/doctor/emergency')}
          className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all cursor-pointer border-2 border-transparent hover:border-red-500 group">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-red-200 transition-colors">🚨</div>
          <div className="text-left">
            <p className="font-bold text-navy-900">Emergency Override</p>
            <p className="text-xs text-red-600 font-medium">Break-glass protocol</p>
          </div>
        </button>
        <button onClick={() => navigate('/doctor/audit-log')}
          className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all cursor-pointer border-2 border-transparent hover:border-navy-800 group">
          <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-navy-100 transition-colors">📝</div>
          <div className="text-left">
            <p className="font-bold text-navy-900">Access Log</p>
            <p className="text-xs text-gray-500">View your activity</p>
          </div>
        </button>
      </div>

      {/* Recent Patients */}
      <div className="card p-5">
        <h3 className="section-title">Recent Patients</h3>
        <div className="space-y-3">
          {RECENT_PATIENTS.map(p => (
            <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
              onClick={() => navigate(`/doctor/patient/${p.id}`)}>
              <div className="w-9 h-9 rounded-full bg-forest-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy-900">{p.name} <span className="text-xs text-gold-600 font-bold">{p.healthId}</span></p>
                <p className="text-xs text-gray-500">{p.condition}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{new Date(p.lastSeen).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                <span className="text-xs text-navy-800 font-semibold">View →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
