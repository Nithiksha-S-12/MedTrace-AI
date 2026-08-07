import React from 'react';
import PageLayout from '../components/common/PageLayout';

export default function AdminManageCitizens() {
  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">👥 Manage Citizens</h1>
        <p className="page-subtitle">Search, view, and manage citizen accounts</p>
      </div>
      <div className="card p-5 mb-5">
        <input type="text" className="form-input w-full md:w-96" placeholder="🔍 Search by Health ID, Govt ID, Name, or Phone" />
      </div>
      <div className="card p-12 text-center text-gray-400">
        <p className="text-xl font-bold text-navy-900 mb-2">Search to load records</p>
        <p className="text-sm">For demo purposes, the citizen list is empty until a search is performed.</p>
      </div>
    </PageLayout>
  );
}
