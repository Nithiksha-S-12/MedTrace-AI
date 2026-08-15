"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;
      if (role === "citizen") router.push("/citizen/dashboard");
      else if (role === "doctor") router.push("/doctor/dashboard");
      else if (role === "diagnostic") router.push("/diagnostic/dashboard");
      else if (role === "admin") router.push("/admin/dashboard");
      else router.push("/login");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-bg">
      <div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
