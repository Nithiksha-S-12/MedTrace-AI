import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const navItems = {
  citizen: [
    { to: '/citizen', label: 'Dashboard', icon: '🏠', exact: true },
    { to: '/citizen/timeline', label: 'Medical Timeline', icon: '📋' },
    { to: '/citizen/ai-summary', label: 'AI Health Summary', icon: '🧠' },
    { to: '/citizen/qr', label: 'Share via QR', icon: '🔲' },
    { to: '/citizen/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/citizen/profile', label: 'My Profile', icon: '👤' },
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard', icon: '🏠', exact: true },
    { to: '/doctor/qr-scan', label: 'Scan QR Code', icon: '📷' },
    { to: '/doctor/emergency', label: 'Emergency Override', icon: '🚨', danger: true },
    { to: '/doctor/audit-log', label: 'My Access Log', icon: '📝' },
  ],
  diagnostic: [
    { to: '/diagnostic', label: 'Dashboard', icon: '🏠', exact: true },
    { to: '/diagnostic/upload', label: 'Upload Scan', icon: '📤' },
    { to: '/diagnostic/history', label: 'Upload History', icon: '📁' },
    { to: '/diagnostic/audit-log', label: 'Audit Log', icon: '📝' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '🏠', exact: true },
    { to: '/admin/citizens', label: 'Manage Citizens', icon: '👥' },
    { to: '/admin/doctors', label: 'Manage Doctors', icon: '🩺' },
    { to: '/admin/hospitals', label: 'Manage Hospitals', icon: '🏥' },
    { to: '/admin/audit-log', label: 'Audit Logs', icon: '🔍' },
    { to: '/admin/reports', label: 'System Reports', icon: '📊' },
  ],
};

const roleLabels = {
  citizen: { label: 'Citizen Portal', color: 'bg-blue-600' },
  doctor: { label: 'Doctor Portal', color: 'bg-forest-800' },
  diagnostic: { label: 'Diagnostic Center', color: 'bg-purple-700' },
  admin: { label: 'Admin Portal', color: 'bg-navy-900' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, unreadCount } = useApp();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const items = navItems[user.role] || [];
  const roleInfo = roleLabels[user.role] || roleLabels.citizen;

  const handleLogout = async () => {
    setLoggingOut(true);
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 bg-navy-800 text-white flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          w-64`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-navy-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-navy-900 font-bold text-lg flex-shrink-0">
              ⚕
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">MedTrace AI</h1>
              <p className="text-xs text-navy-300">Ministry of Health</p>
            </div>
          </div>
          {/* Role Badge */}
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${roleInfo.color} text-white mt-1`}>
            {roleInfo.label}
          </span>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-navy-600 flex items-center justify-center text-sm font-bold">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              {user.healthId && <p className="text-xs text-gold-400">{user.healthId}</p>}
              {user.role === 'citizen' && <p className="text-xs text-navy-300">View Only</p>}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-white text-navy-800 shadow-sm'
                      : item.danger
                        ? 'text-red-300 hover:bg-red-900/40 hover:text-red-200'
                        : 'text-navy-200 hover:bg-navy-700 hover:text-white'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {item.danger && (
                    <span className="text-xs text-red-400 font-bold">!</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-navy-700">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-navy-300 hover:bg-navy-700 hover:text-white transition-all duration-150"
          >
            <span>🚪</span>
            <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
          <p className="text-xs text-navy-500 text-center mt-3">
            Gov Health Dept. v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
