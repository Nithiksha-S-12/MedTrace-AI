"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Activity, ChevronDown, ChevronUp, Clock, FileText, Lock } from "lucide-react";

function EmergencyTimer({ expiresAt }: { expiresAt: string }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const calc = () => setSecs(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const mins = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  const pct = Math.max(0, (secs / (15 * 60)) * 100);

  if (secs === 0) return (
    <div className="bg-gray-900 text-white rounded-xl p-4 flex items-center gap-3">
      <Lock className="w-5 h-5 text-red-400" />
      <p className="font-bold text-red-400">🔒 Emergency Access Expired</p>
    </div>
  );

  return (
    <div className={`rounded-xl p-4 ${secs < 120 ? "bg-red-600" : "bg-orange-600"} text-white`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-semibold text-sm">Emergency Access Expires In</span>
        </div>
        <span className="font-mono font-bold text-xl">{mins}:{s}</span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-2">
        <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function PatientViewPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const isEmergency = searchParams.get("emergency") === "true";
  const expiresAt = searchParams.get("expires") || "";

  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMinor, setShowMinor] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/citizens/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setPatient(data.patient);
        setRecords(data.records || []);
        setLoading(false);
      });
  }, [params.id]);

  const generateSummary = async () => {
    setSummaryLoading(true);
    const res = await fetch("/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId: params.id }),
    });
    const data = await res.json();
    setSummary(data.summary);
    setSummaryLoading(false);
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!patient) return (
    <div className="text-center py-16">
      <p className="text-red-600 font-bold text-lg">Patient not found</p>
    </div>
  );

  const filteredRecords = isEmergency
    ? records.filter((r) => r.category === "critical" || r.category === "chronic")
    : records;

  return (
    <div className="space-y-6">
      {/* Emergency timer */}
      {isEmergency && expiresAt && <EmergencyTimer expiresAt={expiresAt} />}

      {isEmergency && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-3 flex items-center gap-2 text-orange-800 text-sm font-medium">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          Emergency Mode: Showing critical and chronic records only. Mental health and minor history are hidden.
        </div>
      )}

      {/* Patient Header */}
      <div className="bg-gradient-to-r from-gov-navy to-[#29528f] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {patient.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{patient.name}</h1>
            <p className="text-blue-200 font-mono text-sm">{patient.healthId}</p>
            <div className="flex gap-3 mt-1 text-xs text-blue-100">
              <span>Gov ID: {patient.govId}</span>
              {patient.dob && <span>DOB: {new Date(patient.dob).toLocaleDateString("en-IN")}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* AI Triage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b bg-gray-50/50 flex items-center justify-between">
          <h2 className="font-bold text-gov-navy flex items-center gap-2"><Activity className="w-5 h-5" /> AI Triage Summary</h2>
          <button
            onClick={generateSummary}
            disabled={summaryLoading}
            className="text-sm bg-gov-navy text-white px-4 py-2 rounded-lg hover:bg-[#122b50] transition-colors disabled:opacity-60"
          >
            {summaryLoading ? "Analyzing..." : summary ? "Refresh" : "Generate"}
          </button>
        </div>
        <div className="p-5 space-y-3">
          {!summary ? (
            <p className="text-gray-400 text-sm text-center py-4">Click "Generate" to create an AI triage summary</p>
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gov-navy">
                <p className="text-sm font-semibold text-gray-700 mb-1">📄 ER Snapshot</p>
                <p className="text-sm text-gray-600">{summary.summary}</p>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-sm font-bold text-red-800 mb-1">🔴 Critical Alerts</p>
                <p className="text-sm text-red-700">{summary.criticalAlerts}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                <p className="text-sm font-bold text-orange-800 mb-1">🟠 Chronic Conditions</p>
                <p className="text-sm text-orange-700">{summary.chronicConditions}</p>
              </div>
              {!isEmergency && (
                <button onClick={() => setShowMinor(!showMinor)} className="w-full text-left bg-green-50 border border-green-200 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-green-800">🟢 Past Minor Issues</p>
                    {showMinor ? <ChevronUp className="w-4 h-4 text-green-600" /> : <ChevronDown className="w-4 h-4 text-green-600" />}
                  </div>
                  {showMinor && <p className="text-sm text-green-700 mt-2">{summary.minorHistory}</p>}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Records Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b bg-gray-50/50">
          <h2 className="font-bold text-gov-navy flex items-center gap-2">
            <FileText className="w-5 h-5" /> Medical Records
            {isEmergency && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Emergency Mode - Filtered</span>}
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredRecords.length === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm">No records found</p>
          ) : filteredRecords.map((record, i) => (
            <div key={record._id || i} className="p-5">
              <div className="flex items-start gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-1 ${
                  record.category === "critical" ? "bg-red-100 text-red-700" :
                  record.category === "chronic" ? "bg-orange-100 text-orange-700" :
                  "bg-green-100 text-green-700"
                }`}>{record.category || "N/A"}</span>
                <div>
                  <p className="font-semibold text-sm text-gov-text">{record.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {record.type} · {new Date(record.date).toLocaleDateString("en-IN")} · {record.hospital}
                  </p>
                  {record.aiSummary && <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">{record.aiSummary}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
