import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode.react';
import PageLayout from '../components/common/PageLayout';
import api from '../services/api';
import { toast } from 'react-toastify';

const SHARING_LEVELS = [
  { value: 'emergency_only', label: 'Emergency Snippet', desc: 'Allergies, Blood Type, Critical Conditions only', icon: '🚨', color: 'border-red-400 bg-red-50' },
  { value: 'full_timeline', label: 'Full Timeline', desc: 'Complete medical history', icon: '📋', color: 'border-green-400 bg-green-50' },
  { value: 'custom', label: 'Custom Selection', desc: 'Choose specific records to share', icon: '⚙️', color: 'border-blue-400 bg-blue-50' },
];
const DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
];

export default function CitizenQR() {
  const [sharingLevel, setSharingLevel] = useState('emergency_only');
  const [duration, setDuration] = useState(30);
  const [qrData, setQrData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef();

  // Countdown timer
  useEffect(() => {
    if (qrData?.expiresAt) {
      const tick = () => {
        const remaining = Math.max(0, Math.round((new Date(qrData.expiresAt) - Date.now()) / 1000));
        setCountdown(remaining);
        if (remaining === 0) {
          setQrData(prev => prev ? { ...prev, expired: true } : null);
          clearInterval(timerRef.current);
        }
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [qrData?.expiresAt]);

  const generateQR = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/qr/generate', { sharingLevel, duration });
      setQrData(res.data);
      setSessions(prev => [res.data, ...prev]);
      toast.success('QR Code generated! Share with your doctor.');
    } catch {
      // Demo fallback
      const mockToken = `DEMO${Date.now().toString(36).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString();
      const demoQR = {
        sessionToken: mockToken,
        expiresAt,
        sharingLevel,
        duration,
        qrData: JSON.stringify({ token: mockToken, system: 'medtrace', v: 1 }),
      };
      setQrData(demoQR);
      setSessions(prev => [demoQR, ...prev]);
      toast.success('Demo QR generated!');
    } finally {
      setGenerating(false);
    }
  };

  const revokeSession = async (token) => {
    try {
      await api.post(`/qr/revoke/${token}`);
    } catch {}
    setSessions(prev => prev.map(s => s.sessionToken === token ? { ...s, isRevoked: true } : s));
    if (qrData?.sessionToken === token) setQrData(null);
    toast.success('Access revoked successfully!');
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">🔲 Share via QR Code</h1>
        <p className="page-subtitle">Generate a secure, time-limited QR code for your doctor to scan</p>
      </div>

      {/* Security Notice */}
      <div className="alert-info mb-6">
        <p className="text-sm text-blue-800">
          🔒 <strong>QR contains ZERO medical data</strong> — only an encrypted session token. Your doctor must get your OTP approval before accessing any records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator */}
        <div className="card p-6 space-y-5">
          <h3 className="section-title">Configure Access</h3>

          {/* Sharing Level */}
          <div>
            <label className="form-label">Sharing Level</label>
            <div className="space-y-2">
              {SHARING_LEVELS.map(sl => (
                <label key={sl.value} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${sharingLevel === sl.value ? sl.color : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="sharingLevel" value={sl.value} checked={sharingLevel === sl.value} onChange={e => setSharingLevel(e.target.value)} className="mt-1" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{sl.icon}</span>
                      <span className="font-semibold text-sm">{sl.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{sl.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="form-label">Access Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button key={d.value} onClick={() => setDuration(d.value)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md border-2 transition-all ${duration === d.value ? 'bg-navy-800 text-white border-navy-800' : 'border-gray-200 text-gray-600 hover:border-navy-300'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generateQR} disabled={generating} className="btn-primary w-full py-3 text-base">
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </span>
            ) : '🔲 Generate QR Code'}
          </button>
        </div>

        {/* QR Display */}
        <div className="card p-6">
          {qrData && !qrData.expired ? (
            <div className="text-center space-y-4">
              <h3 className="section-title">Show this to your Doctor</h3>

              {/* QR Code */}
              <div className="inline-block p-4 bg-white border-4 border-navy-800 rounded-xl shadow-lg">
                <QRCode
                  value={qrData.qrData || qrData.sessionToken}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Countdown */}
              {countdown !== null && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Expires in:</p>
                  <div className={`text-4xl font-black ${countdown <= 60 ? 'text-red-600 animate-pulse' : 'text-navy-800'}`}>
                    {formatTime(countdown)}
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 rounded-full ${countdown <= 60 ? 'bg-red-500' : 'bg-navy-800'}`}
                      style={{ width: `${(countdown / (duration * 60)) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-3">
                <p>Sharing: <strong>{SHARING_LEVELS.find(s => s.value === qrData.sharingLevel)?.label}</strong></p>
                <p className="mt-1">Token: <code className="bg-gray-200 px-1 rounded text-xs">{qrData.sessionToken?.substring(0, 12)}...</code></p>
              </div>

              <button onClick={() => revokeSession(qrData.sessionToken)} className="btn-danger w-full text-sm">
                🚫 Revoke Access Now
              </button>
            </div>
          ) : qrData?.expired ? (
            <div className="text-center py-12 text-gray-400 space-y-3">
              <span className="text-5xl block">⏰</span>
              <p className="font-medium text-gray-600">QR Code Expired</p>
              <p className="text-sm">Generate a new one to share access</p>
              <button onClick={() => setQrData(null)} className="btn-secondary text-sm">Generate New QR</button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 space-y-3">
              <span className="text-5xl block">🔲</span>
              <p className="font-medium text-gray-600">No Active QR Code</p>
              <p className="text-sm">Configure and generate a QR code on the left</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      {sessions.filter(s => !s.isRevoked).length > 0 && (
        <div className="mt-6 card p-5">
          <h3 className="section-title">Active Sessions</h3>
          <div className="space-y-2">
            {sessions.filter(s => !s.isRevoked).map(s => (
              <div key={s.sessionToken} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="text-sm font-semibold text-navy-900">{SHARING_LEVELS.find(l => l.value === s.sharingLevel)?.label}</p>
                  <p className="text-xs text-gray-500">Expires: {new Date(s.expiresAt).toLocaleString('en-IN')}</p>
                </div>
                <button onClick={() => revokeSession(s.sessionToken)} className="text-xs text-red-600 font-semibold hover:text-red-800 border border-red-300 px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
