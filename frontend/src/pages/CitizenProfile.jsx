import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/common/PageLayout';
import { toast } from 'react-toastify';

export default function CitizenProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: '+91-9876543210',
    email: user?.email || 'citizen@demo.com',
  });
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const handleSave = () => {
    setEditing(false);
    toast.success('Profile updated successfully. OTP sent for verification.');
  };

  const profileFields = [
    { label: 'Full Name', value: user?.name || 'Arjun Kumar', icon: '👤' },
    { label: 'Health ID', value: user?.healthId || 'HID-A7X2K', icon: '🪪', gold: true },
    { label: 'Government ID', value: user?.governmentId || 'GOV-123456789', icon: '🆔', redact: true },
    { label: 'Date of Birth', value: '15 March 1970', icon: '🎂' },
    { label: 'Gender', value: 'Male', icon: '👤' },
    { label: 'Blood Group', value: 'B+', icon: '🩸' },
    { label: 'Address', value: '45, Nehru Nagar, New Delhi - 110001', icon: '📍' },
  ];

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">👤 My Profile</h1>
        <p className="page-subtitle">Your personal details and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Info */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">Personal Information</h3>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-1.5 px-3">
                  ✏️ Edit
                </button>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-navy-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <h2 className="font-bold text-xl text-navy-900">{user?.name || 'Arjun Kumar'}</h2>
                <p className="text-sm text-gray-500">Registered Citizen</p>
                <span className="badge-success mt-1">✓ Identity Verified</span>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {profileFields.map((f) => (
                <div key={f.label} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                  <span className="text-lg w-6 flex-shrink-0">{f.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium">{f.label}</p>
                    <p className={`text-sm font-semibold mt-0.5 ${f.gold ? 'text-gold-600' : 'text-navy-900'}`}>
                      {f.redact ? f.value.replace(/[0-9]/g, (_, i) => i < f.value.length - 4 ? '*' : f.value[i]) : f.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editable Fields */}
          {editing && (
            <div className="card p-5">
              <h3 className="section-title">Update Contact Details</h3>
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mb-4">📱 OTP verification required for changes</p>
              <div className="space-y-3">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="btn-primary">Save Changes</button>
                  <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="section-title">Security</h3>
            <div className="space-y-3">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-navy-900">Two-Factor Auth (2FA)</p>
                  <p className="text-xs text-gray-500">OTP on every login</p>
                </div>
                <button
                  onClick={() => { setTwoFAEnabled(!twoFAEnabled); toast.success(`2FA ${!twoFAEnabled ? 'enabled' : 'disabled'}`); }}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${twoFAEnabled ? 'bg-forest-800' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${twoFAEnabled ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <button onClick={() => toast.info('Password change OTP sent to your phone')} className="btn-secondary w-full text-sm">
                🔑 Change Password
              </button>

              <button onClick={() => toast.info('Active sessions list coming soon')} className="btn-ghost w-full text-sm">
                📱 View Active Sessions
              </button>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card p-5">
            <h3 className="section-title">Emergency Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">Sunita Kumar</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Relation</span><span className="font-medium">Spouse</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">+91-9988776655</span></div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
