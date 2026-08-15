"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, AlertTriangle, QrCode, Upload, Siren } from "lucide-react";

const typeIcons: Record<string, any> = {
  emergency: Siren,
  qr: QrCode,
  upload: Upload,
  default: Bell,
};

const typeBg: Record<string, string> = {
  emergency: "bg-red-50 border-red-200",
  qr: "bg-blue-50 border-blue-200",
  upload: "bg-purple-50 border-purple-200",
  default: "bg-gray-50 border-gray-200",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, status: "read" } : n));
  };

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2">
            <Bell className="w-6 h-6" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">Stay informed about access to your health records</p>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">You'll be notified when doctors access your records</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || typeIcons.default;
            const bg = typeBg[n.type] || typeBg.default;
            return (
              <div key={n._id} className={`rounded-xl p-4 border flex items-start gap-4 ${bg} ${n.status === "unread" ? "shadow-sm" : "opacity-70"}`}>
                <div className="p-2 rounded-full bg-white shadow-sm shrink-0">
                  <Icon className="w-5 h-5 text-gov-navy" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${n.status === "unread" ? "font-semibold text-gray-800" : "text-gray-600"}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {n.status === "unread" && (
                  <button onClick={() => markRead(n._id)} className="flex items-center gap-1 text-xs text-gov-navy font-medium hover:underline shrink-0">
                    <CheckCircle className="w-4 h-4" /> Mark Read
                  </button>
                )}
                {n.status === "read" && <span className="text-xs text-gray-400 shrink-0">Read</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
