"use client";

import { Building2 } from "lucide-react";

const HOSPITALS = [
  { name: "City Hospital", city: "Mumbai", doctors: 12, type: "Government", status: "Active" },
  { name: "Apollo Diagnostics", city: "Delhi", doctors: 8, type: "Private", status: "Active" },
  { name: "AIIMS", city: "Delhi", doctors: 45, type: "Government", status: "Active" },
  { name: "Fortis Healthcare", city: "Bengaluru", doctors: 20, type: "Private", status: "Active" },
  { name: "Medanta", city: "Gurugram", doctors: 30, type: "Private", status: "Active" },
];

export default function AdminHospitalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gov-navy flex items-center gap-2"><Building2 className="w-6 h-6" /> Manage Hospitals</h1>
        <p className="text-sm text-gray-500 mt-1">Registered healthcare facilities in the system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {HOSPITALS.map((h, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-gov-navy" />
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${h.type === "Government" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{h.type}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{h.status}</span>
              </div>
            </div>
            <h3 className="font-bold text-gov-text">{h.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{h.city}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <span>{h.doctors} doctors</span>
              <button className="text-gov-navy text-xs font-medium hover:underline">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
