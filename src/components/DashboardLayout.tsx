"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gov-bg">
        <div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const role = (session.user as any).role;
  const userName = session.user?.name || "User";

  return (
    <div className="min-h-screen bg-gov-bg flex">
      <Sidebar role={role} userName={userName} />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center px-8 justify-between shrink-0">
          <h2 className="text-xl font-semibold text-gov-navy">Health Passport Portal</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> System Secure</span>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
