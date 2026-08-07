import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import StatsCard from '../components/common/StatsCard';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-card p-6 mb-6 text-white relative overflow-hidden">
        <h2 className="text-2xl font-bold mb-1">System Administrator Portal 🔐</h2>
        <p className="text-navy-200 text-sm">Ministry of Health Data Center &nbsp;•&nbsp; Superuser Access</p>
      </div>

      <div className="stats-grid stagger-children">
        <StatsCard icon="👥" label="Total Citizens" value="45.2M" color="blue" trend={12} />
        <StatsCard icon="🩺" label="Verified Doctors" value="1.2M" color="green" trend={5} />
        <StatsCard icon="🚨" label="Emergency Triggers" value="842" color="red" sublabel="Last 24 hours" />
        <StatsCard icon="⏳" label="Pending Verifications" value="156" color="amber" sublabel="Doctors & Hospitals" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title mb-0">Pending Approvals</h3>
            <span className="badge-warning">156 Action Required</span>
          </div>
          <div className="space-y-3">
            {[
              { id: 1, type: 'Doctor', name: 'Dr. Anita Roy', detail: 'MCI-DL-2024-9912' },
              { id: 2, type: 'Hospital', name: 'City Care Clinic', detail: 'REG-88214' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-bold text-navy-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.type} &nbsp;•&nbsp; {item.detail}</p>
                </div>
                <button className="btn-primary py-1.5 px-3 text-xs" onClick={() => navigate(item.type === 'Doctor' ? '/admin/doctors' : '/admin/hospitals')}>Review</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title">System Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600">API Gateway</span><span className="text-green-600 font-bold">99.9% Uptime</span></div>
              <div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-green-500 rounded-full w-full" /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600">AI Triage Engine (Groq)</span><span className="text-green-600 font-bold">24ms Latency</span></div>
              <div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-green-500 rounded-full w-[95%]" /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-600">Database Storage</span><span className="text-amber-600 font-bold">82% Used</span></div>
              <div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-amber-500 rounded-full w-[82%]" /></div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
