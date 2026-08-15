"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { QrCode, Shield, Clock, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const DURATION_OPTIONS = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
];

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(Math.floor(diff / 1000));
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const mins = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");
  const isExpiring = remaining < 60;

  return (
    <span className={`font-mono font-bold text-lg ${isExpiring ? "text-red-600 animate-pulse" : "text-gov-navy"}`}>
      {mins}:{secs}
    </span>
  );
}

export default function QRPage() {
  const { data: session } = useSession();
  const [accessLevel, setAccessLevel] = useState("emergency");
  const [duration, setDuration] = useState(15);
  const [generatedQR, setGeneratedQR] = useState<{ sessionId: string; expiresAt: string } | null>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/qr/sessions");
    const data = await res.json();
    setActiveSessions(data.sessions || []);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessLevel, duration }),
      });
      const data = await res.json();
      if (data.sessionId) {
        setGeneratedQR({ sessionId: data.sessionId, expiresAt: data.expiresAt });
        showToast("QR code generated successfully!");
        fetchSessions();
      } else {
        showToast(data.error || "Failed to generate QR", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (sessionId: string) => {
    const res = await fetch("/api/qr/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (res.ok) {
      showToast("Access revoked successfully!");
      setActiveSessions((s) => s.filter((x) => x.sessionId !== sessionId));
      if (generatedQR?.sessionId === sessionId) setGeneratedQR(null);
    } else {
      showToast("Failed to revoke", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2">
          <QrCode className="w-6 h-6" /> Share Medical QR
        </h1>
        <p className="text-sm text-gray-500 mt-1">Generate a secure, time-limited QR code for doctors to access your records</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gov-navy mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> Access Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Access Level</label>
              {[
                { val: "emergency", label: "Emergency Snippet", desc: "Allergies, Blood type, Critical conditions only" },
                { val: "full", label: "Full Timeline", desc: "Complete medical history" },
              ].map((opt) => (
                <label key={opt.val} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer mb-2 transition-colors ${accessLevel === opt.val ? "border-gov-navy bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="access" value={opt.val} checked={accessLevel === opt.val} onChange={() => setAccessLevel(opt.val)} className="mt-1" />
                  <div>
                    <p className="font-medium text-sm text-gov-text">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gov-navy outline-none"
              >
                {DURATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="w-full bg-gov-navy text-white py-3 rounded-xl font-semibold hover:bg-[#122b50] transition-colors disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate QR Code"}
            </button>
          </div>
        </div>

        {/* QR Display */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          {generatedQR ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-xl border-2 border-gov-navy inline-block">
                <QRCodeSVG value={generatedQR.sessionId} size={180} level="H" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Session Code</p>
                <p className="font-mono font-bold text-gov-navy text-lg tracking-widest">{generatedQR.sessionId}</p>
              </div>
              <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
                <Clock className="w-4 h-4" /> Expires in: <CountdownTimer expiresAt={generatedQR.expiresAt} />
              </div>
              <button onClick={() => revoke(generatedQR.sessionId)} className="text-red-600 text-sm font-medium hover:underline flex items-center gap-1 mx-auto">
                <Trash2 className="w-4 h-4" /> Revoke Access
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <QrCode className="w-16 h-16 mx-auto mb-3 text-gray-200" />
              <p className="font-medium">No QR Generated</p>
              <p className="text-sm">Configure settings and click Generate</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b bg-gray-50/50">
            <h2 className="font-bold text-gov-navy">Active Sessions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {activeSessions.map((s) => (
              <div key={s._id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono font-semibold text-sm text-gov-navy">{s.sessionId}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.accessLevel} · Expires: {new Date(s.expiresAt).toLocaleTimeString()}
                  </p>
                </div>
                <button onClick={() => revoke(s.sessionId)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
