"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CitizenRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    govId: "",
    dob: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.govId.length !== 12) {
      setError("Aadhaar Number must be 12 digits");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "citizen",
          ...formData
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push(`/auth/register/verify-otp?email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(formData.phone)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Citizen Registration
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhaar Number (12 digits)</label>
              <input name="govId" type="text" required value={formData.govId} onChange={handleChange} maxLength={12} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input name="dob" type="date" required value={formData.dob} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input name="password" type="password" required minLength={8} value={formData.password} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input name="confirmPassword" type="password" required minLength={8} value={formData.confirmPassword} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <button type="submit" disabled={loading} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>
                {loading ? "Registering..." : "Sign Up"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">Go back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
