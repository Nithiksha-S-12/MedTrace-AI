"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, CheckCircle, AlertCircle, Key, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pre-fill OTP if passed from forgot-password page
  useEffect(() => {
    const otpParam = searchParams.get("otp");
    if (otpParam) setOtp(otpParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-bg p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-8 justify-center">
          <ShieldCheck className="w-8 h-8 text-gov-navy" />
          <h1 className="text-xl font-bold text-gov-navy">MedTrace AI</h1>
        </div>

        <h2 className="text-2xl font-bold text-gov-text mb-2 text-center">Reset Password</h2>
        <p className="text-gray-500 mb-8 text-center text-sm">
          Enter the 6-digit OTP sent to your phone and choose a new password.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start text-red-700">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 flex items-start text-green-700">
            <CheckCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              OTP (6-digit)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gov-navy focus:border-gov-navy outline-none transition-all text-center font-mono tracking-[0.4em] text-lg"
              placeholder="——————"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gov-navy focus:border-gov-navy outline-none transition-all"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || newPassword.length < 8}
            className="w-full bg-gov-navy hover:bg-[#122b50] text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center space-x-2 shadow-md disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Key className="w-5 h-5" />
                <span>Reset Password</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <a href="/auth/forgot-password" className="text-sm text-gray-500 hover:underline block">
            Didn't receive OTP? Try again
          </a>
          <a href="/login" className="text-sm font-semibold text-gov-navy hover:underline block">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gov-bg">
        <div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
