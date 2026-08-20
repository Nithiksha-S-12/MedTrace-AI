"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DoctorRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    licenseProof: "dummy-proof.pdf", // Mocked upload
    hospitalId: "dummy-id.pdf", // Mocked upload
    specialization: "",
    experience: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "doctor",
          ...formData,
          experience: Number(formData.experience)
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
          Doctor Registration
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
              <input name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Medical Registration Number</label>
              <input name="registrationNumber" type="text" required value={formData.registrationNumber} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <select name="specialization" required value={formData.specialization} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                <option value="">Select Specialization</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Radiology">Radiology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input name="experience" type="number" min="0" required value={formData.experience} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input name="password" type="password" required minLength={8} value={formData.password} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input name="confirmPassword" type="password" required minLength={8} value={formData.confirmPassword} onChange={handleChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Note: Proof of registration and hospital ID uploads are required. (Simulated for hackathon)</p>
              <button type="submit" disabled={loading} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"}`}>
                {loading ? "Registering..." : "Sign Up as Doctor"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/register" className="font-medium text-green-600 hover:text-green-500">Go back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
