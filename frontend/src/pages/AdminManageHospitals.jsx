import React from 'react';
import PageLayout from '../components/common/PageLayout';

export default function AdminManageHospitals() {
  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">🏥 Manage Hospitals & Diagnostic Centers</h1>
        <p className="page-subtitle">Verify institution credentials</p>
      </div>
      <div className="card p-12 text-center text-gray-400">
        <span className="text-5xl block mb-4">🏥</span>
        <h2 className="text-xl font-bold text-navy-900 mb-2">Hospital Directory</h2>
        <p>Similar to doctor management, this interface allows verifying institutional registrations.</p>
      </div>
    </PageLayout>
  );
}
