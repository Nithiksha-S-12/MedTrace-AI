"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Clock, 
  Activity, 
  QrCode, 
  Bell, 
  UserCircle,
  ScanLine,
  Siren,
  FileText,
  Upload,
  History,
  Users,
  Building2,
  LogOut,
  ShieldCheck
} from "lucide-react";

interface SidebarProps {
  role: "citizen" | "doctor" | "diagnostic" | "admin";
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  const citizenLinks = [
    { name: "Dashboard", href: "/citizen/dashboard", icon: LayoutDashboard },
    { name: "Timeline", href: "/citizen/timeline", icon: Clock },
    { name: "AI Summary", href: "/citizen/ai-summary", icon: Activity },
    { name: "Share QR", href: "/citizen/qr", icon: QrCode },
    { name: "Notifications", href: "/citizen/notifications", icon: Bell },
    { name: "Profile", href: "/citizen/profile", icon: UserCircle },
  ];

  const doctorLinks = [
    { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
    { name: "Scan QR", href: "/doctor/qr-scan", icon: ScanLine },
    { name: "Emergency Access", href: "/doctor/emergency", icon: Siren },
    { name: "Audit Log", href: "/doctor/audit", icon: FileText },
  ];

  const diagnosticLinks = [
    { name: "Dashboard", href: "/diagnostic/dashboard", icon: LayoutDashboard },
    { name: "Upload Scan", href: "/diagnostic/upload", icon: Upload },
    { name: "Upload History", href: "/diagnostic/history", icon: History },
  ];

  const adminLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Citizens", href: "/admin/citizens", icon: Users },
    { name: "Doctors", href: "/admin/doctors", icon: UserCircle },
    { name: "Hospitals", href: "/admin/hospitals", icon: Building2 },
    { name: "Audit Logs", href: "/admin/audit", icon: FileText },
  ];

  let links: typeof citizenLinks = [];
  if (role === "citizen") links = citizenLinks;
  else if (role === "doctor") links = doctorLinks;
  else if (role === "diagnostic") links = diagnosticLinks;
  else if (role === "admin") links = adminLinks;

  return (
    <div className="w-64 bg-gov-navy text-white min-h-screen flex flex-col fixed left-0 top-0 border-r border-[#29528f]">
      <div className="p-6 flex items-center space-x-3 border-b border-[#29528f]">
        <ShieldCheck className="w-8 h-8 text-gov-gold" />
        <div>
          <h1 className="font-bold tracking-wide text-lg">MedTrace</h1>
          <p className="text-[10px] text-gov-gold uppercase tracking-wider">Government Passport</p>
        </div>
      </div>

      <div className="p-4 border-b border-[#29528f] bg-white/5">
        <p className="text-sm text-gray-300">Welcome,</p>
        <p className="font-semibold text-sm truncate">{userName}</p>
        <p className="text-xs text-gov-gold capitalize mt-1 border border-gov-gold/30 inline-block px-2 py-0.5 rounded-full">{role}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? "bg-white/10 text-gov-gold font-medium" 
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#29528f]">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg w-full text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Secure Logout</span>
        </button>
      </div>
    </div>
  );
}
