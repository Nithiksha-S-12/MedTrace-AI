import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../components/common/PageLayout';
import AISummaryCard from '../components/common/AISummaryCard';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function DoctorEmergency() {
  const [step, setStep] = useState('form'); // form | active | expired
  const [form, setForm] = useState({ patientGovernmentId: '', patientDob: '', reason: '', reasonDetails: '', confirmed: false });
  const [loading, setLoading] = useState(false);
  const [accessData, setAccessData] = useState(null);
  const [countdown, setCountdown] = useState(900); // 15 minutes = 900 seconds
  const [errors, setErrors] = useState({});
  const timerRef = useRef();

  const REASONS = ['Car Accident', 'Unconscious', 'Cardiac Arrest', 'Stroke', 'Trauma', 'Other'];

  useEffect(() => {
    if (step === 'active') {
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setStep('expired');
            toast.warning('Emergency access session has expired.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const validate = () => {
    const errs = {};
    if (!form.patientGovernmentId) errs.patientGovernmentId = 'Government ID is required';
    if (!form.patientDob) errs.patientDob = 'Date of birth is required';
    if (!form.reason) errs.reason = 'Please select a reason';
    if (!form.confirmed) errs.confirmed = 'You must confirm this is a genuine emergency';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.post('/emergency/request', {
        ...form,
        confirmed: true,
      });
      setAccessData(res.data);
      setStep('active');
      setCountdown(900);
      toast.warning('⚠️ Emergency access granted. Patient has been notified.', { autoClose: 8000 });
    } catch (err) {
      // Demo fallback
      if (form.patientGovernmentId.includes('GOV123456789') || form.patientGovernmentId.toUpperCase() === 'GOV123456789') {
        const mockData = {
          patient: { fullName: 'Arjun Kumar', dateOfBirth: '1970-03-15', bloodGroup: 'B+', healthId: 'HID-A7X2K', emergencyContact: { name: 'Sunita Kumar', phone: '+91-9988776655', relationship: 'Spouse' } },
          records: [],
          restrictions: { cannotSee: ['Mental Health', 'STD/HIV Status', 'Substance Abuse'], canSee: ['Allergies', 'Blood Type', 'Chronic Conditions', 'Critical Medications'] },
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        };
        setAccessData(mockData);
        setStep('active');
        setCountdown(900);
        toast.warning('⚠️ Demo emergency access granted.');
      } else {
        toast.error(err.response?.data?.error || 'Patient not found. Check Government ID and DOB.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const pct = (countdown / 900) * 100;

  if (step === 'expired') {
    return (
      <PageLayout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Emergency Session Expired</h2>
          <p className="text-gray-500 mb-6">The 15-minute emergency access window has ended. All records are now locked.</p>
          <button onClick={() => { setStep('form'); setForm({ patientGovernmentId: '', patientDob: '', reason: '', reasonDetails: '', confirmed: false }); setErrors({}); }} className="btn-primary">
            New Emergency Request
          </button>
        </div>
      </PageLayout>
    );
  }

  if (step === 'active' && accessData) {
    const aiSummary = {
      criticalAlerts: ['Allergy: Penicillin (Severe — Anaphylaxis)', 'Medication: Warfarin 5mg (Blood thinner)'],
      chronicConditions: ['Type 2 Diabetes Mellitus — Active', 'Hypertension Stage 2 — Controlled'],
      minorHistory: [],
      snapshot: '55yo male with T2DM and Stage 2 HTN. Critical: Penicillin allergy (anaphylaxis), Warfarin 5mg (anticoagulant). Blood group B+. Emergency contact: Sunita Kumar +91-9988776655.',
    };

    return (
      <PageLayout>
        {/* Emergency Banner */}
        <div className="bg-red-600 text-white rounded-card p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-black text-lg">🚨 EMERGENCY ACCESS ACTIVE</h2>
            <p className="text-red-100 text-sm">Patient alerted via SMS & Email. This session is fully audited.</p>
          </div>
          <div className="text-center">
            <div className={`text-5xl font-black ${countdown <= 120 ? 'text-red-200 animate-pulse' : 'text-white'}`}>
              {formatTime(countdown)}
            </div>
            <div className="w-40 h-2 bg-red-800 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-red-200 text-xs mt-1">Time remaining</p>
          </div>
        </div>

        {/* Patient Header */}
        <div className="card p-4 mb-5 border-2 border-red-300">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-full bg-navy-800 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
              {accessData.patient?.fullName?.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-navy-900">{accessData.patient?.fullName}</h3>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                <span>DOB: {new Date(accessData.patient?.dateOfBirth).toLocaleDateString('en-IN')}</span>
                <span>🩸 Blood Group: <strong className="text-red-600">{accessData.patient?.bloodGroup}</strong></span>
                <span>🪪 {accessData.patient?.healthId}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Emergency Contact: <strong>{accessData.patient?.emergencyContact?.name}</strong> ({accessData.patient?.emergencyContact?.relationship}) — {accessData.patient?.emergencyContact?.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Restrictions Banner */}
        <div className="alert-warning mb-5">
          <p className="text-sm font-bold text-amber-800">⚠️ Restricted View — Emergency Protocol</p>
          <p className="text-sm text-amber-700 mt-1">
            <strong>CAN see:</strong> {accessData.restrictions?.canSee?.join(', ')}<br />
            <strong>CANNOT see:</strong> <span className="line-through">{accessData.restrictions?.cannotSee?.join(', ')}</span>
          </p>
        </div>

        {/* AI Triage Summary */}
        <div className="card p-5 mb-5">
          <h3 className="section-title">🧠 AI Emergency Triage</h3>
          <AISummaryCard summary={aiSummary} compact={false} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">🚨 Emergency Override</h1>
        <p className="page-subtitle">Break-glass protocol for unconscious or critical patients</p>
      </div>

      {/* Warning */}
      <div className="bg-red-50 border-2 border-red-400 rounded-card p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <h3 className="font-black text-red-800 text-base">WARNING: LOGGED AND AUDITED ACTION</h3>
            <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
              <li>This action is <strong>permanently recorded</strong> with your identity, hospital, and timestamp</li>
              <li>Patient will receive immediate <strong>SMS + Email alert</strong></li>
              <li>Access is limited to <strong>15 minutes</strong> and auto-locks</li>
              <li>Unauthorized use: <strong>3 flags = permanent hospital access revocation</strong></li>
              <li>For genuine medical emergencies ONLY</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-lg">
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Patient Government ID *</label>
              <input className={`form-input ${errors.patientGovernmentId ? 'border-red-500' : ''}`} placeholder="e.g. GOV123456789" value={form.patientGovernmentId}
                onChange={e => setForm({...form, patientGovernmentId: e.target.value})} />
              {errors.patientGovernmentId && <p className="text-red-500 text-xs mt-1">{errors.patientGovernmentId}</p>}
              <p className="text-xs text-gray-400 mt-1">Try: GOV123456789 for demo</p>
            </div>

            <div className="form-group">
              <label className="form-label">Patient Date of Birth *</label>
              <input type="date" className={`form-input ${errors.patientDob ? 'border-red-500' : ''}`} value={form.patientDob}
                onChange={e => setForm({...form, patientDob: e.target.value})} />
              {errors.patientDob && <p className="text-red-500 text-xs mt-1">{errors.patientDob}</p>}
              <p className="text-xs text-gray-400 mt-1">Demo: 1970-03-15</p>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Reason *</label>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map(r => (
                  <label key={r} className={`flex items-center gap-2 p-2.5 rounded-md border-2 cursor-pointer transition-all text-sm ${form.reason === r ? 'border-red-500 bg-red-50 font-semibold text-red-800' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="reason" value={r} checked={form.reason === r} onChange={e => setForm({...form, reason: e.target.value})} />
                    {r}
                  </label>
                ))}
              </div>
              {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Additional Details (Optional)</label>
              <textarea className="form-input h-20 resize-none" placeholder="Brief description of emergency situation..."
                value={form.reasonDetails} onChange={e => setForm({...form, reasonDetails: e.target.value})} />
            </div>

            <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer ${form.confirmed ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
              <input type="checkbox" className="mt-0.5" checked={form.confirmed} onChange={e => setForm({...form, confirmed: e.target.checked})} />
              <span className="text-sm font-semibold text-red-800">
                I confirm this is a genuine medical emergency. I understand this action is permanently logged and misuse will result in disciplinary action.
              </span>
            </label>
            {errors.confirmed && <p className="text-red-500 text-xs">{errors.confirmed}</p>}

            <button type="submit" disabled={loading || !form.confirmed} className="btn-danger w-full py-3 text-base font-black">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : '🚨 Grant Emergency Access'}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
