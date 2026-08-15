"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  FileText, 
  Activity, 
  Stethoscope, 
  AlertTriangle,
  ChevronRight,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function CitizenDashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Citizen";
  
  const [profile, setProfile] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const dbId = (session?.user as any)?.dbId;
    if (!dbId) return;

    // Parallel fetch profile and records
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch(`/api/records?patientId=${dbId}`).then((r) => r.json())
    ])
      .then(([profileData, recordsData]) => {
        if (profileData.user) setProfile(profileData.user);
        if (recordsData.records) setRecords(recordsData.records);
      })
      .catch((err) => console.error("Failed to load dashboard data:", err))
      .finally(() => setLoading(false));
  }, [session]);

  const loadAiSummary = async () => {
    const dbId = (session?.user as any)?.dbId;
    if (!dbId) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: dbId }),
      });
      const data = await res.json();
      if (data.summary) {
        setAiSummary(data.summary);
      }
    } catch (err) {
      console.error("AI summary error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadAiSummary();
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gov-navy" />
      </div>
    );
  }

  const healthId = profile?.healthId || "N/A";
  const totalReports = records.length;
  const totalScans = records.filter((r) => r.type?.toLowerCase().includes("scan")).length;
  const uniqueDoctors = new Set(records.map((r) => r.doctorId?._id || r.doctorId)).size;
  const recentRecords = records.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gov-navy to-[#29528f] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}</h1>
          <p className="text-blue-100 flex items-center">
            Health ID: <span className="font-mono bg-white/20 px-2 py-1 rounded ml-2 text-sm">{healthId}</span>
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform origin-top-right"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-50 p-4 rounded-full text-gov-navy">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Reports</p>
            <p className="text-2xl font-bold text-gov-text">{totalReports}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-green-50 p-4 rounded-full text-green-600">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Scans</p>
            <p className="text-2xl font-bold text-gov-text">{totalScans}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-yellow-50 p-4 rounded-full text-yellow-600">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Visiting Doctors</p>
            <p className="text-2xl font-bold text-gov-text">{uniqueDoctors}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Health Summary Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gov-navy flex items-center">
                <Activity className="w-5 h-5 mr-2 text-yellow-600" />
                AI Health Summary Preview
              </h2>
              <Link href="/citizen/ai-summary" className="text-sm text-gov-navy font-medium hover:underline flex items-center">
                View Full Summary <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="p-6 space-y-4">
              {aiLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing conditions and summary...
                </div>
              ) : aiSummary ? (
                <>
                  <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-red-800">Critical Alerts</h3>
                      <p className="text-sm text-red-700 mt-1">{aiSummary.criticalAlerts || "None detected."}</p>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg flex items-start">
                    <Activity className="w-5 h-5 text-orange-500 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-orange-800">Chronic Conditions</h3>
                      <p className="text-sm text-orange-700 mt-1">{aiSummary.chronicConditions || "None detected."}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No AI summary generated yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 shrink-0 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gov-navy">Recent Timeline</h2>
            <Link href="/citizen/timeline" className="text-sm text-gov-navy font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {recentRecords.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No recent timeline records.</p>
            ) : recentRecords.map((record, i) => (
              <div key={record._id || i} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-0.5 before:bg-gray-200 last:before:hidden">
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-gov-navy border-4 border-white flex items-center justify-center"></div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <h4 className="text-sm font-bold text-gov-text">{record.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(record.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • {record.hospital}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

