"use client";

import { useSession } from "next-auth/react";
import { Upload, Users, FileText, Search } from "lucide-react";
import Link from "next/link";

export default function DiagnosticDashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Diagnostic Center";
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gov-navy to-[#29528f] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome, {userName}</h1>
          <p className="text-blue-100 flex items-center">
            License: <span className="font-mono bg-white/20 px-2 py-1 rounded ml-2 text-sm">DOC002</span>
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform origin-top-right"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/diagnostic/upload" className="bg-gov-navy hover:bg-[#122b50] text-white rounded-xl p-6 shadow-md transition-all flex items-center justify-between group cursor-pointer lg:col-span-2">
          <div>
            <h3 className="font-bold text-xl mb-1">Upload New Scan</h3>
            <p className="text-sm text-blue-100">Upload MRI, CT, X-Ray to patient records</p>
          </div>
          <div className="bg-white/10 p-4 rounded-full group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
        </Link>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-50 p-4 rounded-full text-gov-navy">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Scans Uploaded Today</p>
            <p className="text-2xl font-bold text-gov-text">15</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-50 p-4 rounded-full text-gov-green">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Patients Served</p>
            <p className="text-2xl font-bold text-gov-text">432</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gov-navy">Recent Uploads</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID..." 
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-navy focus:border-gov-navy outline-none text-sm w-64"
            />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Patient ID</th>
              <th className="px-6 py-3 font-medium">Scan Type</th>
              <th className="px-6 py-3 font-medium">Body Part</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-500">Today, 11:30 AM</td>
              <td className="px-6 py-4 text-sm font-mono text-gov-text">HID-A7X2K</td>
              <td className="px-6 py-4 font-medium text-gov-navy">MRI Scan</td>
              <td className="px-6 py-4 text-sm text-gray-500">Brain</td>
              <td className="px-6 py-4">
                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">Success</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
