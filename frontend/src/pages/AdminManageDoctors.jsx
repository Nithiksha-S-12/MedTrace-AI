import React, { useState } from 'react';
import PageLayout from '../components/common/PageLayout';
import { toast } from 'react-toastify';

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Anita Roy', license: 'MCI-DL-2024-9912', spec: 'Cardiology', status: 'pending' },
  { id: 2, name: 'Dr. Rajesh Mehta', license: 'MCI-MH-2019-04521', spec: 'Radiology', status: 'verified' },
  { id: 3, name: 'Dr. Vikas Gupta', license: 'MCI-UP-2015-11223', spec: 'General Practice', status: 'revoked' },
];

export default function AdminManageDoctors() {
  const [doctors, setDoctors] = useState(MOCK_DOCTORS);

  const updateStatus = (id, newStatus) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    toast.success(`Doctor status updated to ${newStatus}`);
  };

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">🩺 Manage Doctors</h1>
        <p className="page-subtitle">Verify medical licenses and manage doctor access</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-navy-800 text-xs font-bold">
            <tr>
              <th className="text-left p-3">Doctor Name</th>
              <th className="text-left p-3">License & Spec</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {doctors.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="p-3 font-bold text-navy-900">{d.name}</td>
                <td className="p-3"><p className="font-mono text-xs">{d.license}</p><p className="text-xs text-gray-500">{d.spec}</p></td>
                <td className="p-3">
                  <span className={`badge-${d.status === 'verified' ? 'success' : d.status === 'revoked' ? 'danger' : 'warning'}`}>
                    {d.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  {d.status === 'pending' && <button onClick={() => updateStatus(d.id, 'verified')} className="btn-success py-1 px-3 text-xs">Verify</button>}
                  {d.status === 'verified' && <button onClick={() => updateStatus(d.id, 'revoked')} className="btn-danger py-1 px-3 text-xs">Revoke</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
