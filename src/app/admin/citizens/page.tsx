"use client";

import { useEffect, useState } from "react";
import { Users, Search } from "lucide-react";

export default function AdminCitizensPage() {
  const [citizens, setCitizens] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/citizens")
      .then((r) => r.json())
      .then((d) => { setCitizens(d.citizens || []); setLoading(false); });
  }, []);

  const filtered = citizens.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.govId?.includes(search) ||
    c.healthId?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2"><Users className="w-6 h-6" /> Manage Citizens</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all registered citizens</p>
        </div>
        <span className="bg-gov-navy text-white text-xs px-3 py-1 rounded-full">{citizens.length} total</span>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, Gov ID, or Health ID..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gov-navy outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Gov ID</th>
              <th className="px-5 py-3 font-medium">Health ID</th>
              <th className="px-5 py-3 font-medium">DOB</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center"><div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No citizens found</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c._id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-medium text-sm text-gov-text">{c.name}</td>
                <td className="px-5 py-4 text-sm font-mono text-gray-600">{c.govId || "–"}</td>
                <td className="px-5 py-4 text-sm font-mono text-gray-600">{c.healthId || "–"}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{c.dob ? new Date(c.dob).toLocaleDateString("en-IN") : "–"}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{c.phone || "–"}</td>
                <td className="px-5 py-4">
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Registered</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
