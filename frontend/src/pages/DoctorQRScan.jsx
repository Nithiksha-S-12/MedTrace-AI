import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import api from '../services/api';
import { toast } from 'react-toastify';

const PATIENT_RECORDS = [
  { _id: 'r1', type: 'scan', scanType: 'MRI', reportTitle: 'MRI Brain', hospitalName: 'Apollo Diagnostics', doctorName: 'Dr. Rajesh Mehta', recordDate: '2024-11-15' },
  { _id: 'r2', type: 'lab_report', reportTitle: 'CBC + HbA1c', hospitalName: 'AIIMS', doctorName: 'Dr. Priya Sharma', recordDate: '2024-09-20' },
  { _id: 'r3', type: 'prescription', reportTitle: 'HTN & DM Prescription', hospitalName: 'AIIMS', doctorName: 'Dr. Priya Sharma', recordDate: '2024-09-20' },
];

export default function DoctorQRScan() {
  const navigate = useNavigate();
  const [step, setStep] = useState('scan'); // scan | otp | records
  const [token, setToken] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [demoOTP, setDemoOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);

  const handleScan = async () => {
    if (!token) { toast.error('Enter or scan a QR token'); return; }
    setLoading(true);
    try {
      const res = await api.post('/qr/scan', { token });
      setSessionId(res.data.sessionId);
      setDemoOTP(res.data.demoOTP || '');
      setStep('otp');
      toast.info('QR scanned! Waiting for patient OTP...');
    } catch {
      // Demo mode: simulate scan
      setSessionId('demo_session_001');
      setDemoOTP('123456');
      setStep('otp');
      toast.info('Demo: QR scanned! OTP for patient: 123456');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/qr/verify-otp', { sessionId, otp });
      setPatientData(res.data);
      setStep('records');
    } catch {
      if (otp === demoOTP || otp === '123456') {
        setPatientData({ patient: { fullName: 'Arjun Kumar', healthId: 'HID-A7X2K', dateOfBirth: '1970-03-15', bloodGroup: 'B+' }, records: PATIENT_RECORDS });
        setStep('records');
        toast.success('OTP verified! Access granted.');
      } else {
        toast.error('Invalid OTP. Patient consent not verified.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'records' && patientData) {
    const p = patientData.patient;
    return (
      <PageLayout>
        <div className="alert-success mb-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-green-800">✅ Access Granted — Patient Verified</p>
            <p className="text-sm text-green-700">Session expires in 30 minutes. Patient has been notified.</p>
          </div>
          <button onClick={() => { setStep('scan'); setToken(''); setOtp(''); setPatientData(null); }} className="text-xs text-green-800 font-semibold border border-green-400 px-3 py-1 rounded hover:bg-green-100">
            End Session
          </button>
        </div>

        <div className="card p-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-forest-800 flex items-center justify-center text-white text-2xl font-bold">{p.fullName?.charAt(0)}</div>
            <div>
              <h2 className="text-xl font-bold text-navy-900">{p.fullName}</h2>
              <p className="text-sm text-gray-500">DOB: {new Date(p.dateOfBirth).toLocaleDateString('en-IN')} &nbsp;•&nbsp; 🩸 {p.bloodGroup} &nbsp;•&nbsp; <span className="text-gold-600 font-bold">{p.healthId}</span></p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="section-title">Medical Records</h3>
          <div className="space-y-3">
            {(patientData.records || PATIENT_RECORDS).map(rec => (
              <div key={rec._id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/citizen/report/${rec._id}`)}>
                <span className="text-xl">{rec.type === 'scan' ? '🔬' : rec.type === 'lab_report' ? '🧪' : '💊'}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-navy-900">{rec.reportTitle}</p>
                  <p className="text-xs text-gray-500">{rec.hospitalName} &nbsp;•&nbsp; {rec.doctorName}</p>
                </div>
                <p className="text-xs text-gray-400">{new Date(rec.recordDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">📷 Scan QR Code</h1>
        <p className="page-subtitle">Scan patient's health QR to request access</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {step === 'scan' && (
          <div className="card p-6 space-y-4">
            <div className="text-center py-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <span className="text-6xl block mb-3">📷</span>
              <p className="text-gray-500 font-medium">Camera QR Scanner</p>
              <p className="text-xs text-gray-400 mt-1">(Use manual entry below for demo)</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">OR ENTER MANUALLY</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="form-group">
              <label className="form-label">Session Code / QR Token</label>
              <input className="form-input" placeholder="Paste QR token or session code..." value={token} onChange={e => setToken(e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Patient will generate this from their app</p>
            </div>

            <button onClick={handleScan} disabled={loading} className="btn-success w-full py-3">
              {loading ? 'Scanning...' : '📷 Scan & Request Access'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="card p-6 space-y-4">
            <div className="text-center">
              <span className="text-5xl block mb-3">🔐</span>
              <h3 className="font-bold text-navy-900 text-lg">Patient OTP Required</h3>
              <p className="text-sm text-gray-500 mt-1">Ask the patient for their 6-digit consent OTP</p>
            </div>

            {demoOTP && (
              <div className="bg-amber-50 border border-amber-300 rounded-md p-3 text-center">
                <p className="text-xs text-amber-700 font-semibold">Demo Mode — Patient OTP:</p>
                <p className="text-3xl font-black text-amber-800 tracking-widest">{demoOTP}</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Enter 6-Digit Patient OTP</label>
              <input type="text" maxLength={6} className="form-input text-center text-2xl tracking-widest font-bold"
                placeholder="• • • • • •" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
            </div>

            <button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6} className="btn-success w-full py-3">
              {loading ? 'Verifying...' : '✓ Verify OTP & Access Records'}
            </button>

            <button onClick={() => setStep('scan')} className="btn-ghost w-full text-sm">← Back</button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
