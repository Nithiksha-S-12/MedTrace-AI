"use client";

import { useEffect, useState } from "react";
import { UserCircle, CheckCircle, XCircle, Search } from "lucide-react";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((d) => { setDoctors(d.doctors || []); setLoading(false); });
  }, []);

  const updateVerification = async (doctorId: string, isVerified: boolean) => {
    const res = await fetch("/api/doctors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, isVerified }),
    });
    if (res.ok) {
      setDoctors((prev) => prev.map((d) => d._id === doctorId ? { ...d, isVerified } : d));
    }
  };

  const filtered = doctors.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.licenseNumber?.includes(search) ||
    d.hospital?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2"><UserCircle className="w-6 h-6" /> Manage Doctors</h1>
          <p className="text-sm text-gray-500 mt-1">Approve or revoke doctor and diagnostic center access</p>
        </div>
        <span className="bg-gov-navy text-white text-xs px-3 py-1 rounded-full">{doctors.length} total</span>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, license, or hospital..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gov-navy outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">License No.</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Hospital</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center"><div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No doctors found</td></tr>
            ) : filtered.map((d, i) => (
              <tr key={d._id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-medium text-sm text-gov-text">{d.name}</td>
                <td className="px-5 py-4 text-sm font-mono text-gray-600">{d.licenseNumber}</td>
                <td className="px-5 py-4"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{d.role}</span></td>
                <td className="px-5 py-4 text-sm text-gray-500">{d.hospital || "–"}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.isVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {d.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {d.isVerified ? (
                    <button onClick={() => updateVerification(d._id, false)} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1 ml-auto">
                      <XCircle className="w-4 h-4" /> Revoke
                    </button>
                  ) : (
                    <button onClick={() => updateVerification(d._id, true)} className="text-green-600 hover:text-green-800 text-xs font-medium flex items-center gap-1 ml-auto">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
