import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gov-bg p-4">
      <div className="mb-8 flex flex-col items-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-gov-gold" />
        <h1 className="text-4xl font-bold text-gov-navy text-center">Welcome to MedTrace AI</h1>
        <p className="text-gray-600 text-lg text-center max-w-xl">
          Secure, centralized, and AI-powered medical records management for citizens and verified healthcare providers.
        </p>
      </div>
      <div className="flex space-x-4">
        <Link href="/login" className="px-6 py-3 bg-gov-navy text-white rounded-lg font-semibold hover:bg-[#122b50] transition-colors">
          Login
        </Link>
        <Link href="/auth/register" className="px-6 py-3 bg-white text-gov-navy border border-gov-navy rounded-lg font-semibold hover:bg-gray-50 transition-colors">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
