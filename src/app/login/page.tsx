"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      id,
      password,
    });

    if (res?.error) {
      setError("Invalid ID or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-bg p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Left Side: Branding / Info */}
        <div className="bg-gradient-to-br from-gov-navy to-[#29528f] p-10 text-white flex flex-col justify-between hidden md:flex">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <ShieldCheck className="w-10 h-10 text-gov-gold" />
              <h1 className="text-2xl font-bold tracking-wide">MedTrace AI</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Government Unified Health Passport
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Secure, centralized, and AI-powered medical records management for citizens and verified healthcare providers.
            </p>
          </div>
          
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <h3 className="font-semibold text-gov-gold mb-2 text-sm uppercase tracking-wider">Demo Access</h3>
            <ul className="text-sm space-y-2 text-blue-50">
              <li><span className="font-semibold">Citizen:</span> 123456789012 / password</li>
              <li><span className="font-semibold">Doctor:</span> DOC001 / password</li>
              <li><span className="font-semibold">Diagnostic:</span> DOC002 / password</li>
              <li><span className="font-semibold">Admin:</span> admin@medtrace.com / password</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="md:hidden flex items-center space-x-3 mb-8">
            <ShieldCheck className="w-8 h-8 text-gov-navy" />
            <h1 className="text-xl font-bold text-gov-navy">MedTrace AI</h1>
          </div>
          
          <h2 className="text-2xl font-bold text-gov-text mb-2">Secure Login</h2>
          <p className="text-gray-500 mb-8">Access your digital health portal.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-start text-red-700">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Government ID / License Number
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gov-navy focus:border-gov-navy outline-none transition-all"
                placeholder="e.g. 1234567890 or DOC001"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gov-navy focus:border-gov-navy outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="mt-2 text-right">
                <a href="/auth/forgot-password" className="text-sm font-medium text-gov-navy hover:text-[#122b50] hover:underline">
                  Forgot Password?
                </a>
              </div>
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
                  <LogIn className="w-5 h-5" />
                  <span>Access Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/auth/register" className="font-semibold text-gov-navy hover:text-[#122b50] hover:underline">
                Sign Up
              </a>
            </p>
            <p className="text-xs text-gray-400">
              By logging in, you agree to the Government Health Data Privacy Guidelines. Unauthorized access is strictly prohibited and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
