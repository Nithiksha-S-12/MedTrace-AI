import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      const routes = { citizen: '/citizen', doctor: '/doctor', diagnostic: '/diagnostic', admin: '/admin' };
      navigate(routes[user.role] || '/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ─── Navigation ─────────────────────────────────────────────── */}
      <nav className="bg-navy-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gold-500 rounded-full flex items-center justify-center text-navy-900 font-bold text-lg">⚕</div>
            <div>
              <span className="font-bold text-base">MedTrace AI</span>
              <span className="text-navy-300 text-xs block">Ministry of Health</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-navy-200 hover:text-white text-sm font-medium transition-colors">Sign In</Link>
            <Link to="/register" className="bg-gold-500 text-navy-900 px-4 py-1.5 rounded-md text-sm font-bold hover:bg-gold-400 transition-colors">Register</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-navy-800 via-navy-700 to-navy-600 text-white py-24 px-6 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Government Badge */}
          <div className="inline-flex items-center gap-2 bg-gold-500 text-navy-900 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            🇮🇳 Official Government Health Initiative
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Your Unified<br />
            <span className="text-gold-400">Health Passport</span>
          </h1>
          <p className="text-xl text-navy-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            One secure health ID for every Indian citizen. AI-powered medical triage, instant QR sharing, and emergency access — all verified by the Government.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={handleGetStarted} className="bg-gold-500 text-navy-900 px-8 py-3.5 rounded-lg text-base font-bold hover:bg-gold-400 transition-all hover:scale-105 shadow-lg">
              🚀 Get Your Health ID
            </button>
            <Link to="/login" className="bg-white/10 backdrop-blur border border-white/30 text-white px-8 py-3.5 rounded-lg text-base font-bold hover:bg-white/20 transition-all">
              Sign In →
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            {[
              { value: '50M+', label: 'Citizens Registered' },
              { value: '1.2M+', label: 'Verified Doctors' },
              { value: '99.9%', label: 'Uptime Guarantee' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-gold-400">{s.value}</p>
                <p className="text-xs text-navy-300 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ───────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-govbg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900">Everything in One Passport</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">World-class healthcare technology meeting India's scale</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'AI Triage Engine', desc: 'Groq + Llama 3 analyzes your complete medical history to produce Red/Orange/Green triage summaries instantly.', color: 'bg-blue-50' },
              { icon: '🔲', title: 'Secure QR Sharing', desc: 'Share encrypted session tokens — not your data. Two-factor patient consent with OTP before any doctor access.', color: 'bg-green-50' },
              { icon: '🚨', title: 'Emergency Protocol', desc: 'Break-glass access for unconscious patients. 15-minute time-locked sessions with instant SMS alerts to family.', color: 'bg-red-50' },
              { icon: '🔍', title: 'OCR Digitization', desc: 'Upload photos of physical reports. Tesseract.js extracts text in-browser — zero server cost, maximum privacy.', color: 'bg-purple-50' },
              { icon: '🏥', title: 'DICOM Viewer', desc: 'View MRI, CT, and X-Ray scans directly in the browser. Zoom, pan, and adjust window/level controls.', color: 'bg-amber-50' },
              { icon: '📋', title: 'Complete Audit Trail', desc: 'Every access event logged with actor, IP, timestamp. Flag suspicious activity. Export as CSV anytime.', color: 'bg-teal-50' },
            ].map((f) => (
              <div key={f.title} className="card p-6 hover:shadow-card-hover transition-shadow duration-200">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>{f.icon}</div>
                <h3 className="font-bold text-navy-900 text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── User Roles ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900">Built for Everyone in Healthcare</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '👤', role: 'Citizen', desc: 'View-only access to your complete medical history. Generate QR codes to share securely.', badge: 'bg-blue-100 text-blue-800' },
              { icon: '🩺', role: 'Doctor', desc: 'Access patient records via QR scan. Emergency override protocol. Consultation notes.', badge: 'bg-green-100 text-green-800' },
              { icon: '🏥', role: 'Diagnostic Center', desc: 'Upload DICOM scans and reports. OCR digitization. Identity-verified uploads only.', badge: 'bg-purple-100 text-purple-800' },
              { icon: '🔐', role: 'System Admin', desc: 'Approve doctors & hospitals. Complete audit trail. Block accounts. System reports.', badge: 'bg-orange-100 text-orange-800' },
            ].map((r) => (
              <div key={r.role} className="card p-5 text-center hover:shadow-card-hover transition-shadow">
                <div className="text-4xl mb-3">{r.icon}</div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${r.badge}`}>{r.role}</span>
                <p className="text-sm text-gray-600">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-navy-800 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your Health Passport?</h2>
          <p className="text-navy-300 mb-8">Join millions of Indians who trust MedTrace AI with their health data.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="bg-gold-500 text-navy-900 px-8 py-3 rounded-lg font-bold hover:bg-gold-400 transition-colors">
              Register Now — It's Free
            </Link>
            <Link to="/login" className="border border-white/30 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-navy-400 py-8 px-6 text-center text-sm">
        <p>© 2024 Ministry of Health, Government of India. MedTrace AI – Government Unified Health Passport.</p>
        <p className="mt-1">All medical data is encrypted and protected under the Digital Personal Data Protection Act, 2023.</p>
      </footer>
    </div>
  );
}
