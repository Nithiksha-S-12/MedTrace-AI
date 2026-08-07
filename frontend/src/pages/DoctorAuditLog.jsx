import React, { useState } from 'react';
import PageLayout from '../components/common/PageLayout';

const MOCK_LOGS = [
  { _id: 'a1', action: 'RECORD_VIEW', targetPatientName: 'Arjun Kumar', details: 'Viewed CBC + HbA1c report via QR session', isEmergency: false, timestamp: '2024-11-20T10:30:00Z' },
  { _id: 'a2', action: 'QR_SCAN', targetPatientName: 'Arjun Kumar', details: 'Scanned QR — Full Timeline', isEmergency: false, timestamp: '2024-11-20T10:28:00Z' },
  { _id: 'a3', action: 'EMERGENCY_ACCESS_GRANT', targetPatientName: 'Arjun Kumar', details: 'Emergency override — Reason: Cardiac Arrest. 15-min access granted.', isEmergency: true, timestamp: '2024-10-05T02:45:00Z' },
];

export default function DoctorAuditLog() {
  const [logs] = useState(MOCK_LOGS);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'emergency' ? logs.filter(l => l.isEmergency)
    : filter === 'access' ? logs.filter(l => ['RECORD_VIEW', 'QR_SCAN'].includes(l.action))
    : logs;

  const exportCSV = () => {
    const csv = ['Action,Patient,Details,Emergency,Timestamp',
      ...filtered.map(l => `${l.action},"${l.targetPatientName}","${l.details}",${l.isEmergency},${l.timestamp}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my_access_log.csv'; a.click();
  };

  return (
    <PageLayout>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">📝 My Access Log</h1>
          <p className="page-subtitle">Your personal audit trail of all patient record access</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary text-sm">⬇️ Export CSV</button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[['all', 'All'], ['access', 'Record Access'], ['emergency', '🚨 Emergency']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filter === val ? 'bg-navy-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-navy-800 text-xs font-bold">
              <tr>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Patient</th>
                <th className="text-left p-3">Details</th>
                <th className="text-left p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(log => (
                <tr key={log._id} className={`hover:bg-gray-50 ${log.isEmergency ? 'bg-red-50' : ''}`}>
                  <td className="p-3">
                    <span className={`badge-${log.isEmergency ? 'danger' : log.action === 'QR_SCAN' ? 'info' : 'gray'}`}>
                      {log.isEmergency ? '🚨 ' : ''}{log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-navy-900">{log.targetPatientName || '-'}</td>
                  <td className="p-3 text-gray-600 text-xs max-w-xs truncate">{log.details}</td>
                  <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><span className="text-4xl block mb-2">📭</span><p>No logs found</p></div>}
      </div>
    </PageLayout>
  );
}
