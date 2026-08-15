"use client";

import { useSession } from "next-auth/react";
import { Users, ScanLine, Siren, Search, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Doctor";
  
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gov-navy to-[#29528f] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome, {userName}</h1>
          <p className="text-blue-100 flex items-center">
            License: <span className="font-mono bg-white/20 px-2 py-1 rounded ml-2 text-sm">DOC001</span>
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform origin-top-right"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/doctor/qr-scan" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gov-navy transition-all group flex flex-col items-center justify-center text-center">
          <div className="bg-blue-50 p-4 rounded-full text-gov-navy mb-3 group-hover:scale-110 transition-transform">
            <ScanLine className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gov-text">Scan Patient QR</h3>
          <p className="text-sm text-gray-500 mt-1">Access records via QR</p>
        </Link>
        
        <Link href="/doctor/emergency" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-red-500 transition-all group flex flex-col items-center justify-center text-center">
          <div className="bg-red-50 p-4 rounded-full text-red-600 mb-3 group-hover:scale-110 transition-transform">
            <Siren className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gov-text">Emergency Access</h3>
          <p className="text-sm text-gray-500 mt-1">Break-glass protocol</p>
        </Link>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="font-bold text-gov-text mb-3">Search Patient</h3>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Health ID or Gov ID" 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-navy focus:border-gov-navy outline-none"
            />
          </div>
          <button className="mt-3 w-full bg-gov-navy text-white py-2 rounded-lg text-sm font-medium hover:bg-[#122b50] transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Stats and Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gov-navy flex items-center">
              <Users className="w-5 h-5 mr-2 text-gov-navy" />
              Recent Patients (Today)
            </h2>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Patient Name</th>
                  <th className="px-6 py-3 font-medium">Health ID</th>
                  <th className="px-6 py-3 font-medium">Time Accessed</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gov-text">Arjun Kumar</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">HID-A7X2K</td>
                  <td className="px-6 py-4 text-sm text-gray-500">10:45 AM</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gov-navy hover:text-[#122b50] text-sm font-medium flex items-center justify-end w-full">
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="space-y-6">
           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="bg-blue-50 p-4 rounded-full text-gov-navy">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Patients Seen Today</p>
              <p className="text-2xl font-bold text-gov-text">8</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 border-l-4 border-l-red-500">
            <div className="bg-red-50 p-4 rounded-full text-red-600">
              <Siren className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Emergencies Today</p>
              <p className="text-2xl font-bold text-red-600">1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
