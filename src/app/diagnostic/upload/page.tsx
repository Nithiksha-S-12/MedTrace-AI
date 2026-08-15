"use client";

import { useState } from "react";
import { Upload, Search, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const SCAN_TYPES = ["MRI", "CT Scan", "X-Ray", "Ultrasound", "Lab Report", "Prescription", "Other"];
const CATEGORIES = ["minor", "chronic", "critical"];

export default function UploadScanPage() {
  const [govId, setGovId] = useState("");
  const [patient, setPatient] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [type, setType] = useState(SCAN_TYPES[0]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("minor");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const searchPatient = async () => {
    if (!govId.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    setPatient(null);

    const res = await fetch(`/api/citizens?id=${govId}`);
    const data = await res.json();
    setSearchLoading(false);

    if (data.citizens && data.citizens.length > 0) {
      setPatient(data.citizens[0]);
    } else {
      setSearchError("No citizen found with this Government ID.");
    }
  };

  const handleUpload = async () => {
    if (!patient || !confirmed || !title || !date || !hospital) return;
    setUploading(true);
    setUploadError("");

    const res = await fetch("/api/diagnostic/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ govId, type, title, date, hospital, aiSummary: notes, category }),
    });
    const data = await res.json();
    setUploading(false);

    if (data.success) {
      setUploadSuccess(true);
      setTitle(""); setDate(""); setNotes(""); setConfirmed(false);
    } else {
      setUploadError(data.error || "Upload failed");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2"><Upload className="w-6 h-6" /> Upload Scan</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a patient's medical scan or report to their digital health passport</p>
      </div>

      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5 shrink-0" /> Scan uploaded and patient notified successfully!
        </div>
      )}

      {/* Patient Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-bold text-gov-navy flex items-center gap-2"><Search className="w-5 h-5" /> Find Patient</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={govId}
            onChange={(e) => setGovId(e.target.value)}
            placeholder="Enter Government ID"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gov-navy outline-none"
          />
          <button onClick={searchPatient} disabled={searchLoading} className="bg-gov-navy text-white px-5 py-3 rounded-xl font-medium text-sm hover:bg-[#122b50] transition-colors disabled:opacity-60">
            {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </div>

        {searchError && <p className="text-red-600 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {searchError}</p>}

        {patient && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-bold text-blue-800 mb-1">Patient Found</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
              <span><strong>Name:</strong> {patient.name}</span>
              <span><strong>Health ID:</strong> {patient.healthId}</span>
              <span><strong>DOB:</strong> {patient.dob ? new Date(patient.dob).toLocaleDateString("en-IN") : "N/A"}</span>
              <span><strong>Gov ID:</strong> {patient.govId}</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Form */}
      {patient && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gov-navy">Scan Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Scan Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gov-navy">
                {SCAN_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gov-navy capitalize">
                {CATEGORIES.map((c) => <option key={c} className="capitalize">{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Report Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Brain MRI - Pre-op Assessment" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gov-navy" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Scan Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gov-navy" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hospital/Lab *</label>
              <input type="text" value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="Hospital name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gov-navy" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Clinical Notes / Summary</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Brief clinical notes or findings..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gov-navy resize-none" />
          </div>

          <label className="flex items-start gap-3 p-3 border border-gray-200 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 accent-gov-navy" />
            <p className="text-sm text-gray-700">I confirm this scan belongs to the identified patient and all information is accurate.</p>
          </label>

          {uploadError && <p className="text-red-600 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {uploadError}</p>}

          <button
            onClick={handleUpload}
            disabled={!confirmed || !title || !date || !hospital || uploading}
            className="w-full bg-gov-navy text-white py-3 rounded-xl font-semibold hover:bg-[#122b50] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Scan</>}
          </button>
        </div>
      )}
    </div>
  );
}
