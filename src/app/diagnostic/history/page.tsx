"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { History, FileText, Filter } from "lucide-react";

const typeColors: Record<string, string> = {
  minor: "bg-green-100 text-green-700",
  chronic: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function DiagnosticHistoryPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const dbId = (session?.user as any)?.dbId;
    if (!dbId) return;
    // Fetch records uploaded by this diagnostic center (doctorId = uploader)
    fetch(`/api/records`)
      .then((r) => r.json())
      .then((d) => { setRecords(d.records || []); setLoading(false); });
  }, [session]);

  const filtered = typeFilter === "all" ? records : records.filter((r) => r.type === typeFilter);
  const types = ["all", ...Array.from(new Set(records.map((r) => r.type)))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2"><History className="w-6 h-6" /> Upload History</h1>
          <p className="text-sm text-gray-500 mt-1">All scans uploaded by your center</p>
        </div>
        <span className="bg-gov-navy text-white text-xs px-3 py-1 rounded-full">{filtered.length} records</span>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500" />
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${typeFilter === t ? "bg-gov-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t === "all" ? "All Types" : t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Category</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center"><div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No records uploaded yet</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={r._id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm font-medium text-gov-text">{r.patientId?.name || "N/A"}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{r.title}</td>
                <td className="px-5 py-4">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{r.type}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{new Date(r.date).toLocaleDateString("en-IN")}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${typeColors[r.category] || "bg-gray-100 text-gray-700"}`}>{r.category || "N/A"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
