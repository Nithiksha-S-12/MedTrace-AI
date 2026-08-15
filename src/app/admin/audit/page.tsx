"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Filter } from "lucide-react";

const actionColors: Record<string, string> = {
  QR_ACCESS: "bg-blue-100 text-blue-700",
  EMERGENCY_OVERRIDE: "bg-red-100 text-red-700",
  UPLOAD_SCAN: "bg-purple-100 text-purple-700",
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => { setLogs(d.logs || []); setLoading(false); });
  }, []);

  const actions = ["all", "QR_ACCESS", "EMERGENCY_OVERRIDE", "UPLOAD_SCAN"];
  const filtered = actionFilter === "all" ? logs : logs.filter((l) => l.action === actionFilter);

  const exportCsv = () => {
    const header = "Performed By,Role,Action,Patient,Timestamp,Details\n";
    const rows = filtered.map((l) =>
      `"${l.performedBy?.name || "N/A"}","${l.role}","${l.action}","${l.patientId?.name || "N/A"}","${new Date(l.timestamp).toLocaleString()}","${l.details || ""}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "system_audit.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2"><FileText className="w-6 h-6" /> System Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">Complete record of all sensitive actions across the platform</p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500" />
        {actions.map((a) => (
          <button key={a} onClick={() => setActionFilter(a)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${actionFilter === a ? "bg-gov-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {a === "all" ? "All Actions" : a.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <th className="px-5 py-3 font-medium">Performed By</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-5 py-3 font-medium">Timestamp</th>
              <th className="px-5 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center"><div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No audit entries found</td></tr>
            ) : filtered.map((l, i) => (
              <tr key={l._id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-sm font-medium text-gov-text">{l.performedBy?.name || "N/A"}</td>
                <td className="px-5 py-4"><span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">{l.role}</span></td>
                <td className="px-5 py-4"><span className={`text-xs font-medium px-2 py-1 rounded-full ${actionColors[l.action] || "bg-gray-100 text-gray-700"}`}>{l.action}</span></td>
                <td className="px-5 py-4 text-sm text-gray-600">{l.patientId?.name || "N/A"}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{new Date(l.timestamp).toLocaleString("en-IN")}</td>
                <td className="px-5 py-4 text-xs text-gray-500 max-w-xs truncate">{l.details || "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
