import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const pageTitles = {
  '/citizen': 'Dashboard',
  '/citizen/timeline': 'Medical Timeline',
  '/citizen/ai-summary': 'AI Health Summary',
  '/citizen/qr': 'Share via QR Code',
  '/citizen/notifications': 'Notifications',
  '/citizen/profile': 'My Profile',
  '/doctor': 'Doctor Dashboard',
  '/doctor/qr-scan': 'Scan QR Code',
  '/doctor/emergency': '🚨 Emergency Override',
  '/doctor/audit-log': 'My Access Log',
  '/diagnostic': 'Diagnostic Dashboard',
  '/diagnostic/upload': 'Upload Scan / Report',
  '/diagnostic/history': 'Upload History',
  '/diagnostic/audit-log': 'Audit Log',
  '/admin': 'Admin Dashboard',
  '/admin/citizens': 'Manage Citizens',
  '/admin/doctors': 'Manage Doctors',
  '/admin/hospitals': 'Manage Hospitals',
  '/admin/audit-log': 'System Audit Log',
  '/admin/reports': 'System Reports',
};

export default function Header() {
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen, unreadCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || 'MedTrace AI';

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10 sticky top-0">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <div className="w-5 space-y-1">
            <span className={`block h-0.5 bg-current transition-transform duration-200 ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-current transition-opacity duration-200 ${sidebarOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-transform duration-200 ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>

        {/* Ministry Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-navy-800 font-bold text-sm md:text-base">{pageTitle}</span>
          </div>
          <p className="text-xs text-gray-500 hidden sm:block">
            Government Health Department – Health Passport System
          </p>
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Emergency Banner for citizen */}
        {user?.role === 'citizen' && (
          <span className="hidden md:inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            🔒 View Only
          </span>
        )}

        {/* Notification Bell */}
        {user?.role === 'citizen' && (
          <button
            onClick={() => navigate('/citizen/notifications')}
            className="relative p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* User Avatar */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 cursor-default">
          <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-navy-900 leading-none">{user?.name?.split(' ')[0]}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
