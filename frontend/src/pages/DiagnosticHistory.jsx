import React from 'react';
import PageLayout from '../components/common/PageLayout';

const MOCK_HISTORY = [
  { id: 1, healthId: 'HID-A7X2K', patient: 'Arjun Kumar', type: 'MRI Brain', method: 'DICOM', status: 'Success', date: '2024-11-20T10:45:00Z' },
  { id: 2, healthId: 'HID-B3R9M', patient: 'Meera Patel', type: 'CBC Panel', method: 'PDF', status: 'Success', date: '2024-11-20T09:15:00Z' },
  { id: 3, healthId: 'HID-C5T7P', patient: 'Suresh Reddy', type: 'ECG Report', method: 'OCR', status: 'Success', date: '2024-11-19T16:30:00Z' },
];

export default function DiagnosticHistory() {
  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">📁 Upload History</h1>
        <p className="page-subtitle">Records uploaded by your diagnostic center</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-navy-800 text-xs font-bold">
              <tr>
                <th className="text-left p-3">Patient</th>
                <th className="text-left p-3">Report Type</th>
                <th className="text-left p-3">Format</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_HISTORY.map(h => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-bold text-navy-900">{h.patient}</p>
                    <p className="text-xs text-gray-500">{h.healthId}</p>
                  </td>
                  <td className="p-3 font-medium">{h.type}</td>
                  <td className="p-3"><span className="badge-gray">{h.method}</span></td>
                  <td className="p-3"><span className="badge-success">{h.status}</span></td>
                  <td className="p-3 text-gray-500">{new Date(h.date).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
