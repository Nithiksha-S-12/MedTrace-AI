import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = (token as any)?.role;

    // Role-based route protection
    if (pathname.startsWith("/citizen") && role !== "citizen") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
    }
    if (pathname.startsWith("/doctor") && role !== "doctor") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
    }
    if (pathname.startsWith("/diagnostic") && role !== "diagnostic") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
    }
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/citizen/:path*",
    "/doctor/:path*",
    "/diagnostic/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
  ],
};
