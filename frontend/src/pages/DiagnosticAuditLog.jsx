import React from 'react';
import PageLayout from '../components/common/PageLayout';

export default function DiagnosticAuditLog() {
  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">📝 Audit Log</h1>
        <p className="page-subtitle">Compliance and activity log for this center</p>
      </div>
      <div className="card p-12 text-center text-gray-400">
        <span className="text-5xl block mb-4">🔍</span>
        <h2 className="text-xl font-bold text-navy-900 mb-2">Audit Logs</h2>
        <p>This page will display a full cryptographic audit trail of all staff activity.</p>
        <p className="text-sm mt-2">Available in the next phase of the rollout.</p>
      </div>
    </PageLayout>
  );
}
