import React from 'react';
import PageLayout from '../components/common/PageLayout';

export default function AdminReports() {
  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">📊 System Reports</h1>
        <p className="page-subtitle">Analytics and usage statistics</p>
      </div>
      <div className="card p-12 text-center text-gray-400">
        <span className="text-5xl block mb-4">📈</span>
        <h2 className="text-xl font-bold text-navy-900 mb-2">Analytics Dashboard</h2>
        <p>Charts and graphs for system adoption, health trends, and API usage.</p>
      </div>
    </PageLayout>
  );
}
