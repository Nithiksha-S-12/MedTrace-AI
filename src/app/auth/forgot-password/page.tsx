"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle, Phone, Copy } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process request");
      }

      setMaskedPhone(data.maskedPhone || "");
      setDemoOtp(data.demoOtp || "");
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(demoOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    // Pass OTP as query param so reset page can pre-fill it
    router.push(`/auth/reset-password?otp=${demoOtp}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-bg p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-8 justify-center">
          <ShieldCheck className="w-8 h-8 text-gov-navy" />
          <h1 className="text-xl font-bold text-gov-navy">MedTrace AI</h1>
        </div>

        <h2 className="text-2xl font-bold text-gov-text mb-2 text-center">Forgot Password</h2>
        <p className="text-gray-500 mb-8 text-center text-sm">
          Enter your Government ID, Phone, or Email and we'll send an OTP to your registered phone.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start text-red-700">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Government ID / Phone / Email
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gov-navy focus:border-gov-navy outline-none transition-all"
                placeholder="e.g. 123456789012 or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gov-navy hover:bg-[#122b50] text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center space-x-2 shadow-md disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  <span>Send OTP to Phone</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Success banner */}
            <div className="p-4 bg-green-50 border-l-4 border-green-500 flex items-start text-green-700">
              <CheckCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">OTP Sent!</p>
                <p>An OTP has been sent to your registered phone number ending in <span className="font-mono font-bold">{maskedPhone}</span>.</p>
              </div>
            </div>

            {/* Demo OTP hint (hackathon only) */}
            {demoOtp && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-800 mb-2">⚙️ Demo Mode — OTP (normally sent via SMS):</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-bold text-2xl tracking-[0.3em] text-amber-900">{demoOtp}</span>
                  <button
                    onClick={handleCopyOtp}
                    className="flex items-center gap-1 text-xs text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleContinue}
              className="w-full bg-gov-navy hover:bg-[#122b50] text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center space-x-2 shadow-md"
            >
              <span>Enter OTP & Reset Password</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm font-semibold text-gov-navy hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
