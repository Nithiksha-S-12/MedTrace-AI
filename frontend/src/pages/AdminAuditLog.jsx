import React from 'react';
import PageLayout from '../components/common/PageLayout';

export default function AdminAuditLog() {
  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">🔍 System Audit Log</h1>
        <p className="page-subtitle">Global cryptographic audit trail</p>
      </div>
      <div className="card p-12 text-center text-gray-400">
        <span className="text-5xl block mb-4">🛡️</span>
        <h2 className="text-xl font-bold text-navy-900 mb-2">Immutable Audit Trail</h2>
        <p>This page displays all system actions, filtered by suspicious activity, emergency overrides, and admin actions.</p>
      </div>
    </PageLayout>
  );
}
