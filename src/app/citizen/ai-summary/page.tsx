"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Brain,
  AlertTriangle,
  Activity,
  Leaf,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from "lucide-react";

interface AISummaryData {
  criticalAlerts: string;
  chronicConditions: string;
  minorHistory: string;
  summary: string;
  updatedAt?: string;
}

export default function AISummaryPage() {
  const { data: session, status } = useSession();
  const [summary, setSummary] = useState<AISummaryData | null>(null);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [medicalHistoryText, setMedicalHistoryText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [expandedMinor, setExpandedMinor] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Generate or re-generate summary via /api/ai/summarize
  const generateNewSummary = useCallback(
    async (historyText?: string) => {
      const dbId = (session?.user as any)?.dbId;
      const healthId = (session?.user as any)?.healthId;
      const patientId = dbId || healthId;

      setRegenerating(true);
      setError("");

      try {
        const res = await fetch("/api/ai/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            medicalHistory: historyText || medicalHistoryText,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to generate summary.");
          return;
        }

        if (data.summary) {
          setSummary(data.summary);
          setLastUpdated(new Date());
        } else {
          setError(data.message || "No medical data available to summarize.");
        }
      } catch (err: any) {
        console.error("AI summarize error:", err);
        setError("Network error while contacting AI service. Please try again.");
      } finally {
        setRegenerating(false);
      }
    },
    [session, medicalHistoryText]
  );

  // Load existing summary & medical history on page load
  const loadSummaryAndHistory = useCallback(async () => {
    const healthId = (session?.user as any)?.healthId;
    const dbId = (session?.user as any)?.dbId;
    const identifier = healthId || dbId;

    if (!identifier) return;

    setLoading(true);
    setError("");

    try {
      // 1. Fetch Medical History records
      let fetchedHistoryText = "";
      try {
        const histRes = await fetch(
          `/api/citizen/medical-history${healthId ? `?healthId=${healthId}` : ""}`
        );
        if (histRes.ok) {
          const histData = await histRes.json();
          if (histData.records) setRecordCount(histData.records.length);
          if (histData.medicalHistory) {
            fetchedHistoryText = histData.medicalHistory;
            setMedicalHistoryText(histData.medicalHistory);
          }
        }
      } catch (e) {
        console.warn("Could not fetch medical history:", e);
      }

      // 2. Fetch Existing Saved Summary from /api/citizen/summary
      const summaryRes = await fetch(
        `/api/citizen/summary${healthId ? `?healthId=${healthId}` : ""}`
      );

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        if (summaryData.summary && summaryData.summary.summary) {
          setSummary(summaryData.summary);
          if (summaryData.summary.updatedAt) {
            setLastUpdated(new Date(summaryData.summary.updatedAt));
          } else {
            setLastUpdated(new Date());
          }
          setLoading(false);
          return;
        }
      }

      // 3. If no existing summary is found, trigger initial AI summarization
      await generateNewSummary(fetchedHistoryText);
    } catch (err: any) {
      console.error("Load summary error:", err);
      setError("Failed to load health summary.");
    } finally {
      setLoading(false);
    }
  }, [session, generateNewSummary]);

  useEffect(() => {
    if (session) {
      loadSummaryAndHistory();
    }
  }, [session, loadSummaryAndHistory]);

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Brain className="w-16 h-16 text-gov-navy animate-pulse" />
            <Sparkles className="w-6 h-6 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Analyzing Medical History</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            MedTrace AI is reviewing clinical records and synthesizing triage summaries...
          </p>
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div className="w-3 h-3 rounded-full bg-orange-500 animate-ping [animation-delay:0.2s]" />
            <div className="w-3 h-3 rounded-full bg-green-500 animate-ping [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    );
  }

  const isCriticalEmpty =
    !summary?.criticalAlerts ||
    summary.criticalAlerts.toLowerCase().includes("none") ||
    summary.criticalAlerts.toLowerCase().includes("no known") ||
    summary.criticalAlerts.toLowerCase().includes("no critical");

  const isChronicEmpty =
    !summary?.chronicConditions ||
    summary.chronicConditions.toLowerCase().includes("none") ||
    summary.chronicConditions.toLowerCase().includes("no chronic");

  const isMinorEmpty =
    !summary?.minorHistory ||
    summary.minorHistory.toLowerCase().includes("none") ||
    summary.minorHistory.toLowerCase().includes("no minor");

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gov-navy/10 rounded-xl">
              <Brain className="w-6 h-6 text-gov-navy" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gov-navy tracking-tight">AI Health Summary</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Real-time AI-powered triage assessment and medical record breakdown
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => generateNewSummary()}
          disabled={regenerating}
          className="flex items-center justify-center gap-2 bg-gov-navy text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#122b50] active:scale-95 transition-all shadow-sm disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
          {regenerating ? "Analyzing..." : "Regenerate Summary"}
        </button>
      </div>

      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gov-navy" />
          <span>
            Based on <strong>{recordCount} medical record(s)</strong> & health history
          </span>
        </div>
        {lastUpdated && (
          <span className="text-gray-400">
            Last Updated: {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={() => generateNewSummary()}
              className="mt-2 text-xs text-red-700 underline font-medium hover:text-red-900"
            >
              Try Regenerating
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {summary && (
        <>
          {/* 1. ER Snapshot (Top Card) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0F2537] via-[#1a385c] to-[#0d1e30] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/40">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Brain className="w-48 h-48 text-white" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
                <span className="font-bold text-xs uppercase tracking-widest text-cyan-300">
                  50-Word ER Triage Snapshot
                </span>
              </div>
              <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-blue-200 border border-white/10 font-mono">
                EMERGENCY READY
              </span>
            </div>

            <p className="text-base sm:text-lg leading-relaxed text-blue-50/95 font-medium">
              "{summary.summary}"
            </p>
          </div>

          {/* 2. Red Banner - Critical Alerts */}
          <div
            className={`rounded-2xl border ${
              isCriticalEmpty
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-red-300 bg-gradient-to-r from-red-50 via-rose-50 to-red-50"
            } p-6 shadow-sm transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isCriticalEmpty ? "bg-emerald-100" : "bg-red-100"}`}>
                  {isCriticalEmpty ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-red-600 animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isCriticalEmpty ? "text-emerald-900" : "text-red-900"}`}>
                    Critical Alerts & Life Threats
                  </h3>
                  <p className="text-xs text-gray-600">Allergies, blood thinners, critical emergency risks</p>
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  isCriticalEmpty ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"
                }`}
              >
                {isCriticalEmpty ? "Clear" : "HIGH PRIORITY"}
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-inner mt-2">
              <p className={`text-sm sm:text-base font-semibold ${isCriticalEmpty ? "text-emerald-800" : "text-red-800"}`}>
                {summary.criticalAlerts}
              </p>
            </div>
          </div>

          {/* 3. Orange Cards - Chronic Conditions */}
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-100">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-orange-900">Chronic Conditions & Ongoing Care</h3>
                  <p className="text-xs text-gray-600">Long-term management diseases and active treatments</p>
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  isChronicEmpty ? "bg-gray-200 text-gray-700" : "bg-orange-200 text-orange-800"
                }`}
              >
                {isChronicEmpty ? "None" : "Ongoing"}
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-inner mt-2">
              <p className="text-sm sm:text-base font-semibold text-orange-900">
                {summary.chronicConditions}
              </p>
            </div>
          </div>

          {/* 4. Green Collapsible - Minor History */}
          <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 p-6 shadow-sm overflow-hidden">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setExpandedMinor((prev) => !prev)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-100">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-green-900">Past Minor Issues & Resolved History</h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        isMinorEmpty ? "bg-gray-200 text-gray-600" : "bg-green-200 text-green-800"
                      }`}
                    >
                      {isMinorEmpty ? "None" : "Resolved"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Resolved conditions, minor lab tests, and past acute episodes</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-green-800 text-sm font-medium">
                <span>{expandedMinor ? "Hide Details" : "View Details"}</span>
                {expandedMinor ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {expandedMinor && (
              <div className="mt-4 pt-3 border-t border-green-200/60 animate-fadeIn">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-inner">
                  <p className="text-sm sm:text-base font-medium text-green-900">
                    {summary.minorHistory}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200/60">
            <p className="text-xs text-gray-500 leading-relaxed">
              ⚠️ <strong>Disclaimer:</strong> This AI Triage Summary is automatically generated using medical NLP models from recorded patient EHR data. It is intended to assist medical professionals during rapid triage and does not constitute a formal diagnosis or replacement for clinical judgment.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
