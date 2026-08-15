"use client";

import { useSession } from "next-auth/react";
import { ShieldCheck, Users, Activity, Siren, Building2, UserCircle, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Administrator";
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gov-navy to-[#29528f] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {userName}</h1>
            <p className="text-blue-100 flex items-center">
              Role: System Administrator <ShieldCheck className="w-4 h-4 ml-2 text-gov-gold" />
            </p>
          </div>
          <div className="hidden md:block bg-white/10 p-4 rounded-xl border border-white/20 text-center">
            <p className="text-sm text-blue-100 uppercase tracking-wider mb-1">System Status</p>
            <p className="text-xl font-bold text-gov-gold flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-2" /> All Systems Nominal
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform origin-top-right"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-50 p-4 rounded-full text-gov-navy">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Citizens</p>
            <p className="text-2xl font-bold text-gov-text">1.2M</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-50 p-4 rounded-full text-gov-green">
            <UserCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Verified Doctors</p>
            <p className="text-2xl font-bold text-gov-text">45K</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-yellow-50 p-4 rounded-full text-gov-gold">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Hospitals</p>
            <p className="text-2xl font-bold text-gov-text">3,200</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4 border-l-4 border-l-red-500">
          <div className="bg-red-50 p-4 rounded-full text-red-600">
            <Siren className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Emergencies Today</p>
            <p className="text-2xl font-bold text-red-600">842</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gov-navy">Pending Approvals (Doctors)</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">License</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="px-6 py-4 font-medium text-gov-text">Dr. Amit Singh</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">DOC4592</td>
                  <td className="px-6 py-4 text-right">
                    <button className="bg-gov-green hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium mr-2 transition-colors">Approve</button>
                    <button className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded text-xs font-medium transition-colors">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gov-navy">Recent Security Logs</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="px-6 py-4">
                    <span className="flex items-center text-sm font-medium text-red-600">
                      <Siren className="w-4 h-4 mr-2" /> Emergency Override
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">DOC001</td>
                  <td className="px-6 py-4 text-sm text-gray-500">2 mins ago</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-6 py-4">
                    <span className="flex items-center text-sm font-medium text-gov-text">
                      <Activity className="w-4 h-4 mr-2 text-gov-navy" /> QR Scan Access
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">DOC084</td>
                  <td className="px-6 py-4 text-sm text-gray-500">15 mins ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
