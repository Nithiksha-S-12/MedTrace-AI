"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, CheckCircle, AlertCircle, Loader2, ArrowRight, KeyRound, Copy } from "lucide-react";

type Step = "input" | "validating" | "otp" | "verifying" | "success" | "error";

export default function QRScanPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [sessionCode, setSessionCode] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [patientInfo, setPatientInfo] = useState<{ name: string; accessLevel: string; expiresAt: string; demoOtp?: string } | null>(null);
  const [patientId, setPatientId] = useState("");

  const handleValidate = async () => {
    if (!sessionCode.trim()) return;
    setStep("validating");
    setErrorMsg("");

    try {
      const res = await fetch("/api/qr/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Validation failed.");
        setStep("error");
        return;
      }

      setPatientInfo({
        name: data.patientName,
        accessLevel: data.accessLevel,
        expiresAt: data.expiresAt,
        demoOtp: data.demoOtp,
      });
      setStep("otp");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStep("error");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setStep("verifying");
    setErrorMsg("");

    try {
      const res = await fetch("/api/qr/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "OTP verification failed.");
        setStep("otp");
        return;
      }

      setPatientId(data.patientId);
      setStep("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStep("otp");
    }
  };

  const reset = () => {
    setStep("input");
    setSessionCode("");
    setOtp("");
    setErrorMsg("");
    setPatientInfo(null);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2">
          <ScanLine className="w-6 h-6" /> Scan Patient QR
        </h1>
        <p className="text-sm text-gray-500 mt-1">Validate a patient session code and verify with OTP to access their records</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {[
          { label: "Enter Code", active: step === "input" || step === "validating" || step === "error" },
          { label: "OTP Verify", active: step === "otp" || step === "verifying" },
          { label: "Access", active: step === "success" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.active ? "bg-gov-navy text-white" : "bg-gray-200 text-gray-500"}`}>
              {i + 1}
            </div>
            <span className={`text-xs font-medium ${s.active ? "text-gov-navy" : "text-gray-400"}`}>{s.label}</span>
            {i < 2 && <div className="h-px bg-gray-200 flex-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        {/* STEP 1: Enter session code */}
        {(step === "input" || step === "validating") && (
          <div className="space-y-5">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50">
              <ScanLine className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Enter the 12-character code shown on the patient's QR screen</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Session Code</label>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                placeholder="e.g. A1B2C3D4E5F6"
                maxLength={12}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 font-mono text-xl tracking-[0.3em] text-center focus:ring-2 focus:ring-gov-navy outline-none uppercase"
              />
            </div>
            <button
              onClick={handleValidate}
              disabled={!sessionCode.trim() || step === "validating"}
              className="w-full bg-gov-navy text-white py-3 rounded-xl font-semibold hover:bg-[#122b50] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {step === "validating" ? <><Loader2 className="w-4 h-4 animate-spin" /> Validating...</> : <>Validate Code <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {/* STEP 2: OTP entry */}
        {(step === "otp" || step === "verifying") && patientInfo && (
          <div className="space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-bold text-green-800 mb-1">✅ Session Validated!</p>
              <p className="text-sm text-green-700">Patient: <strong>{patientInfo.name}</strong></p>
              <p className="text-xs text-green-600">Access Level: {patientInfo.accessLevel} · Expires: {new Date(patientInfo.expiresAt).toLocaleTimeString()}</p>
            </div>

            {/* Demo OTP hint */}
            {patientInfo.demoOtp && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">⚙️ Demo Mode — OTP (normally sent via SMS):</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-amber-900 tracking-widest">{patientInfo.demoOtp}</span>
                  <button onClick={() => { setOtp(patientInfo.demoOtp!); }} className="text-xs text-amber-700 border border-amber-300 px-2 py-0.5 rounded hover:bg-amber-100 flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Use
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <KeyRound className="w-4 h-4" /> Enter 6-Digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                placeholder="000000"
                maxLength={6}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 font-mono text-2xl tracking-[0.5em] text-center focus:ring-2 focus:ring-gov-navy outline-none"
              />
              {errorMsg && <p className="text-red-600 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errorMsg}</p>}
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">Back</button>
              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || step === "verifying"}
                className="flex-2 bg-gov-navy text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#122b50] transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {step === "verifying" ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <>Verify OTP <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === "success" && (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <p className="text-xl font-bold text-green-700">Access Granted!</p>
              <p className="text-sm text-gray-500 mt-1">OTP verified. You now have consent-based access to patient records.</p>
            </div>
            <button
              onClick={() => router.push(`/doctor/patient/${patientId}`)}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
            >
              Open Patient Records <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={reset} className="text-gray-500 text-sm hover:underline">Scan another patient</button>
          </div>
        )}

        {/* Error state */}
        {step === "error" && (
          <div className="text-center py-6 space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <p className="text-xl font-bold text-red-700">Validation Failed</p>
              <p className="text-sm text-gray-600 mt-1">{errorMsg}</p>
            </div>
            <button onClick={reset} className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
