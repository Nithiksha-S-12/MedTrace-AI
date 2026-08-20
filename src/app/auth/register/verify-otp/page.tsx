"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "OTP Verification failed");
      }

      setVerified(true);
      setTimeout(() => {
        router.push("/auth/login?registered=true");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-medium text-green-600 mb-2">Registration Successful!</h3>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <p className="text-sm text-gray-600 text-center">
        We have sent a verification code to {email} and {phone}. <br/>
        (For demo, any code works, check server logs)
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
        <input name="otp" type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center tracking-widest text-lg" placeholder="------" maxLength={6} />
      </div>

      <div>
        <button type="submit" disabled={loading || !otp} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading || !otp ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </form>
  );
}

export default function VerifyOTP() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<div>Loading...</div>}>
            <OTPForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
