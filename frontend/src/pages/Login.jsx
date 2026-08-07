import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  if (user) {
    const routes = {
      citizen: '/citizen-dashboard',
      doctor: '/doctor-dashboard',
      diagnostic: '/diagnostic-dashboard',
      admin: '/admin-dashboard'
    };
    return <Navigate to={routes[user.role] || '/citizen-dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id || !form.password) {
      setError('Both fields are required');
      return;
    }

    setLoading(true);
    const result = await login(form.id, form.password);
    setLoading(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
      const routes = {
        citizen: '/citizen-dashboard',
        doctor: '/doctor-dashboard',
        diagnostic: '/diagnostic-dashboard',
        admin: '/admin-dashboard'
      };
      navigate(routes[result.user.role]);
    } else {
      toast.error(result.error);
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-govbg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-navy-800 p-8 text-center">
          <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center text-navy-900 font-bold text-3xl mx-auto shadow-lg mb-4">⚕</div>
          <h1 className="text-white font-bold text-2xl">MedTrace AI</h1>
          <p className="text-navy-300 text-sm">Government Unified Health Passport</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-navy-900 mb-1">Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your credentials to access the portal</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">User ID</label>
              <input
                type="text"
                className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800 ${error ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="e.g., 1234567890 or DOC001"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-1">Password</label>
              <input
                type="password"
                className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-800 ${error ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
            </div>

            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

            <button
              type="submit"
              className="w-full bg-gold-500 text-navy-900 font-bold py-3 rounded-lg hover:bg-gold-400 transition-colors flex items-center justify-center shadow-md"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : '🔐 Sign In Securely'}
            </button>
          </form>

          {/* Bypass Instructions */}
          <div className="mt-6 p-4 bg-navy-50 rounded-lg border border-navy-100">
            <h3 className="text-xs font-bold text-navy-900 mb-2">Demo Credentials:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li><strong>Citizen:</strong> 1234567890 / password</li>
              <li><strong>Doctor:</strong> DOC001 / password</li>
              <li><strong>Diagnostic:</strong> DOC002 / password</li>
              <li><strong>Admin:</strong> ADMIN001 / password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
