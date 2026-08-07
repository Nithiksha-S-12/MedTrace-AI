import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import api from '../services/api';

const MOCK_RECORDS = [
  { _id: 'record_001', type: 'scan', scanType: 'MRI', bodyPart: 'Brain', reportTitle: 'MRI Brain — Routine Checkup', hospitalName: 'Apollo Diagnostics Center', doctorName: 'Dr. Rajesh Mehta', recordDate: '2024-11-15' },
  { _id: 'record_002', type: 'lab_report', reportTitle: 'Complete Blood Count + HbA1c Panel', hospitalName: 'AIIMS New Delhi', doctorName: 'Dr. Priya Sharma', recordDate: '2024-09-20' },
  { _id: 'record_003', type: 'prescription', reportTitle: 'Prescription — Hypertension & Diabetes', hospitalName: 'AIIMS New Delhi', doctorName: 'Dr. Priya Sharma', recordDate: '2024-09-20' },
  { _id: 'record_004', type: 'scan', scanType: 'Chest X-Ray', bodyPart: 'Chest', reportTitle: 'Chest X-Ray PA View — Annual Screening', hospitalName: 'Apollo Diagnostics Center', doctorName: 'Dr. Rajesh Mehta', recordDate: '2024-06-10' },
  { _id: 'record_005', type: 'lab_report', reportTitle: 'Renal Function Test + Electrolytes', hospitalName: 'AIIMS New Delhi', doctorName: 'Dr. Priya Sharma', recordDate: '2024-03-05' },
  { _id: 'record_006', type: 'consultation', reportTitle: 'URTI — Resolved', hospitalName: 'AIIMS New Delhi', doctorName: 'Dr. Priya Sharma', recordDate: '2023-01-12' },
];

const TYPE_ICONS = { scan: '🔬', lab_report: '🧪', prescription: '💊', consultation: '🩺', vaccination: '💉' };
const TYPE_COLORS = { scan: 'badge-info', lab_report: 'badge-success', prescription: 'badge-warning', consultation: 'badge-gray', vaccination: 'badge-success' };
const FILTERS = ['all', 'scan', 'lab_report', 'prescription', 'consultation'];

export default function CitizenTimeline() {
  const navigate = useNavigate();
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/citizens/records?type=${filter}&search=${search}`);
        if (res.data.records?.length) setRecords(res.data.records);
      } catch {}
    };
    load();
  }, [filter, search]);

  const filtered = records.filter(r => {
    const matchType = filter === 'all' || r.type === filter;
    const s = search.toLowerCase();
    const matchSearch = !search ||
      r.reportTitle.toLowerCase().includes(s) ||
      r.hospitalName?.toLowerCase().includes(s) ||
      r.doctorName?.toLowerCase().includes(s);
    return matchType && matchSearch;
  });

  // Group by year
  const grouped = filtered.reduce((acc, rec) => {
    const year = new Date(rec.recordDate).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(rec);
    return acc;
  }, {});

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">Medical Timeline</h1>
        <p className="page-subtitle">Your complete, chronological medical history</p>
      </div>

      {/* Filter + Search */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        {/* Filter Tabs */}
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filter === f ? 'bg-navy-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {TYPE_ICONS[f] || '🗂️'} {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="flex-1 min-w-48">
          <input type="text" className="form-input" placeholder="🔍 Search by hospital, doctor, or report..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-xs text-gray-500 font-medium">{filtered.length} records</span>
      </div>

      {/* Timeline */}
      {Object.keys(grouped).sort((a, b) => b - a).map(year => (
        <div key={year} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-7 bg-navy-800 rounded-full flex items-center justify-center text-white text-xs font-bold">{year}</div>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{grouped[year].length} records</span>
          </div>

          <div className="space-y-3">
            {grouped[year].map(rec => (
              <div key={rec._id} className="card-hover p-4 flex items-start gap-4 cursor-pointer group"
                onClick={() => navigate(`/citizen/report/${rec._id}`)}>
                {/* Icon */}
                <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {TYPE_ICONS[rec.type] || '📄'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-navy-900 text-sm">{rec.reportTitle}</h3>
                    <span className={TYPE_COLORS[rec.type] || 'badge-gray'}>
                      {rec.scanType || rec.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    🏥 {rec.hospitalName} &nbsp;•&nbsp; 👨‍⚕️ {rec.doctorName}
                    {rec.bodyPart && <> &nbsp;•&nbsp; {rec.bodyPart}</>}
                  </p>
                </div>

                {/* Date + Actions */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs font-medium text-gray-700">
                    {new Date(rec.recordDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <button className="text-xs text-navy-800 font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">📭</span>
          <p className="font-medium">No records found</p>
          <p className="text-sm mt-1">Try a different filter or search term</p>
        </div>
      )}
    </PageLayout>
  );
}
