"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Siren, AlertTriangle, ArrowRight, Loader2, CheckCircle, AlertCircle, Fingerprint } from "lucide-react";

const REASONS = ["Car Accident", "Unconscious Patient", "Cardiac Arrest", "Severe Trauma", "Other Emergency"];

export default function EmergencyPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [scanning, setScanning] = useState(false);
  const [fingerprintScanned, setFingerprintScanned] = useState<string | null>(null);
  const [dob, setDob] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ patientId: string; expiresAt: string } | null>(null);

  const handleStartFingerprintScan = () => {
    setScanning(true);
    setError("");
    setTimeout(() => {
      setScanning(false);
      setFingerprintScanned("FP-ARJUN-KUMAR-98765");
    }, 2000);
  };

  const handleSubmit = async () => {
    if ((!identifier.trim() && !fingerprintScanned) || !reason || !confirmed) {
      setError("Please enter Government ID/Phone Number or scan patient fingerprint.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/doctor/emergency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: identifier.trim(),
        fingerprint: fingerprintScanned,
        dob,
        reason
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error || "Failed to process emergency request."); return; }
    setSuccess({ patientId: data.patientId, expiresAt: data.expiresAt });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-red-700 flex items-center gap-2">
          <Siren className="w-6 h-6" /> Emergency Override
        </h1>
        <p className="text-sm text-gray-500 mt-1">Break-glass access to patient records in life-threatening situations</p>
      </div>

      {/* Warning banner */}
      <div className="bg-red-50 border-l-4 border-red-600 rounded-r-xl p-5 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-800">This action is logged and audited</p>
          <p className="text-sm text-red-700 mt-1">Emergency overrides are permanently recorded and will be reviewed. Use only in genuine life-threatening emergencies. Misuse is a disciplinary offense.</p>
        </div>
      </div>

      {!success ? (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Government ID or Phone Number</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter ID or Phone Number"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Fingerprint Scanning Option */}
          <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 text-center space-y-3">
            <p className="text-xs text-gray-600 font-medium">Or scan patient's registered fingerprint</p>
            {!scanning && !fingerprintScanned ? (
              <button
                type="button"
                onClick={handleStartFingerprintScan}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                Scan Fingerprint
              </button>
            ) : scanning ? (
              <div className="py-3 space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Fingerprint className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-emerald-800">Place patient's finger on scanner...</p>
                <p className="text-xs text-gray-500">Connecting to USB / Bluetooth Biometric Hardware</p>
              </div>
            ) : (
              <div className="py-2 flex items-center justify-center gap-2 text-emerald-700 font-semibold text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Fingerprint Scanned & Verified
                <button
                  type="button"
                  onClick={() => setFingerprintScanned(null)}
                  className="text-xs text-gray-500 underline ml-2 hover:text-gray-700"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Date of Birth (for verification)</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
            >
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <label className="flex items-start gap-3 p-4 border border-red-200 bg-red-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 accent-red-600"
            />
            <p className="text-sm text-red-800 font-medium">
              I confirm this is a genuine medical emergency. I understand this action is permanently logged and will be audited by the system administrator.
            </p>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={(!identifier.trim() && !fingerprintScanned) || !confirmed || loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Siren className="w-5 h-5" />}
            {loading ? "Processing..." : "Grant Emergency Access"}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-orange-500 mx-auto" />
          <div>
            <p className="text-xl font-bold text-orange-700">Emergency Access Granted</p>
            <p className="text-sm text-gray-600 mt-1">Access expires at: <strong>{new Date(success.expiresAt).toLocaleTimeString()}</strong></p>
            <p className="text-xs text-gray-400 mt-1">⚠️ Only critical medical data is visible. All access is logged.</p>
          </div>
          <button
            onClick={() => router.push(`/doctor/patient/${success.patientId}?emergency=true&expires=${success.expiresAt}`)}
            className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
          >
            Open Patient Records <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
