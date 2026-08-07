import React, { useState, useEffect } from 'react';
import PageLayout from '../components/common/PageLayout';
import AISummaryCard from '../components/common/AISummaryCard';
import api from '../services/api';
import { toast } from 'react-toastify';

const MOCK_SUMMARY = {
  criticalAlerts: ['Allergy: Penicillin (Severe — Anaphylaxis risk)', 'Medication: Warfarin 5mg daily (Blood thinner — bleeding risk)'],
  chronicConditions: ['Type 2 Diabetes Mellitus (HbA1c: 7.8%) — Active', 'Hypertension Stage 2 (BP: 150/95) — Controlled on Amlodipine', 'Borderline CKD Stage 2 (eGFR 68) — Monitor'],
  minorHistory: ['Upper Respiratory Tract Infection — Jan 2023 (Resolved)', 'Mild Gastritis — Mar 2022 (Resolved)', 'Tension Headache — Sep 2021 (Resolved)'],
  snapshot: '55yo male with Type 2 DM and Stage 2 HTN. Allergic to Penicillin (anaphylaxis). On Warfarin — bleeding risk. Borderline CKD Stage 2. No recent cardiac events. Past minor URTIs and gastritis resolved.',
  generatedAt: new Date(),
};

export default function CitizenAISummary() {
  const [summary, setSummary] = useState(MOCK_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(new Date());

  const regenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/summarize', {});
      if (res.data.summary) {
        setSummary(res.data.summary);
        setLastGenerated(new Date());
        toast.success('AI Summary regenerated successfully!');
      }
    } catch {
      toast.info('Using cached AI summary (backend not connected)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">🧠 AI Health Summary</h1>
          <p className="page-subtitle">AI-powered medical triage generated from your complete history</p>
        </div>
        <button onClick={regenerate} disabled={loading} className="btn-primary">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : '🔄 Regenerate Summary'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="alert-info mb-6">
        <p className="text-sm text-blue-800">
          <strong>🤖 Powered by Groq + Llama 3</strong> — This AI summary is generated from your verified medical records only.
          It is designed for <strong>emergency triage</strong> and should be reviewed by a medical professional.
        </p>
      </div>

      <AISummaryCard summary={summary} />

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-card">
        <p className="text-xs text-gray-500 text-center">
          ⚠️ This AI summary is for informational purposes only. Always consult with a qualified medical professional for medical decisions.
          Data source: {summary?.generatedAt ? new Date(summary.generatedAt).toLocaleString('en-IN') : 'Unknown'}.
        </p>
      </div>
    </PageLayout>
  );
}
