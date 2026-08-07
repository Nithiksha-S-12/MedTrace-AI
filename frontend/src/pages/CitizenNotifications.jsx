import React, { useState } from 'react';
import PageLayout from '../components/common/PageLayout';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'emergency_access', title: '⚠️ Emergency Access Alert', message: 'Dr. Priya Sharma accessed your records under emergency protocol on Oct 5, 2024. Reason: Cardiac Arrest.', isRead: false, timestamp: '2024-10-05T02:45:00Z', severity: 'high' },
  { id: 2, type: 'new_record', title: '📋 New Record Added', message: 'Dr. Rajesh Mehta uploaded your MRI Brain scan report from Apollo Diagnostics Center.', isRead: true, timestamp: '2024-11-15T09:15:00Z', severity: 'info' },
  { id: 3, type: 'qr_scanned', title: '🔍 QR Code Scanned', message: 'Dr. Priya Sharma scanned your health QR code on Nov 20, 2024. Access level: Full Timeline.', isRead: true, timestamp: '2024-11-20T10:30:00Z', severity: 'medium' },
  { id: 4, type: 'new_record', title: '📁 Lab Report Available', message: 'Your Renal Function Test results are now available in your health passport.', isRead: false, timestamp: '2024-03-05T11:00:00Z', severity: 'info' },
];

const SEVERITY_STYLES = {
  high: 'border-l-4 border-red-500 bg-red-50',
  medium: 'border-l-4 border-amber-500 bg-amber-50',
  info: 'border-l-4 border-blue-500 bg-blue-50',
};

export default function CitizenNotifications() {
  const { markAllRead } = useApp();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unread = notifications.filter(n => !n.isRead).length;

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };
  const markAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  return (
    <PageLayout>
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">🔔 Notifications</h1>
          <p className="page-subtitle">{unread > 0 ? `${unread} unread notifications` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="btn-secondary text-sm">✓ Mark all as read</button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map(notif => (
          <div key={notif.id}
            className={`card p-4 cursor-pointer transition-all hover:shadow-card-hover ${SEVERITY_STYLES[notif.severity] || ''} ${!notif.isRead ? 'opacity-100' : 'opacity-70'}`}
            onClick={() => markRead(notif.id)}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-navy-900">{notif.title}</h3>
                  {!notif.isRead && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-sm text-gray-600">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notif.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">🔕</span>
            <p className="font-medium">No notifications yet</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
