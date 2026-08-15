"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Clock, FileText, Syringe, TestTube, Search, Filter } from "lucide-react";

const typeColors: Record<string, string> = {
  Scan: "bg-blue-100 text-blue-800",
  "Lab Report": "bg-purple-100 text-purple-800",
  Prescription: "bg-green-100 text-green-800",
  default: "bg-gray-100 text-gray-800",
};

const typeIcons: Record<string, any> = {
  Scan: FileText,
  "Lab Report": TestTube,
  Prescription: Syringe,
};

export default function TimelinePage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dbId = (session?.user as any)?.dbId;
    if (!dbId) return;

    fetch(`/api/records?patientId=${dbId}`)
      .then((r) => r.json())
      .then((data) => {
        setRecords(data.records || []);
        setFiltered(data.records || []);
      })
      .finally(() => setLoading(false));
  }, [session]);

  useEffect(() => {
    let results = records;
    if (typeFilter !== "all") results = results.filter((r) => r.type === typeFilter);
    if (search) results = results.filter((r) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.hospital?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, typeFilter, records]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2">
            <Clock className="w-6 h-6" /> Medical Timeline
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your complete medical history in chronological order</p>
        </div>
        <span className="bg-gov-navy text-white text-xs px-3 py-1 rounded-full font-medium">
          {filtered.length} Records
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or hospital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gov-navy focus:border-gov-navy outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {["all", "Scan", "Lab Report", "Prescription"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === t ? "bg-gov-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No medical records found</p>
          <p className="text-gray-400 text-sm mt-1">Your records will appear here once uploaded by a doctor or diagnostic center.</p>
        </div>
      ) : (
        <div className="relative pl-4">
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {filtered.map((record, i) => {
              const Icon = typeIcons[record.type] || FileText;
              const color = typeColors[record.type] || typeColors.default;
              const doctor = record.doctorId;
              return (
                <div key={record._id || i} className="relative pl-12">
                  <div className="absolute left-3 top-4 w-8 h-8 rounded-full bg-gov-navy border-4 border-white flex items-center justify-center shadow">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{record.type}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(record.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gov-text">{record.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {record.hospital} {doctor?.name ? `• ${doctor.name}` : ""}
                        </p>
                        {record.aiSummary && (
                          <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg border-l-2 border-gov-navy">
                            {record.aiSummary}
                          </p>
                        )}
                      </div>
                      {record.category && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                          record.category === "critical" ? "bg-red-100 text-red-700" :
                          record.category === "chronic" ? "bg-orange-100 text-orange-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {record.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
