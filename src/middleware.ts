import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

type AuthToken = {
  role?: "ADMIN" | "OPERATOR" | "VIEWER";
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as AuthToken | null;
    const role = token?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/users") || path.startsWith("/audit-logs")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    if (path.startsWith("/vms/new") || path.startsWith("/hardware/new") || path.startsWith("/imports")) {
      if (role === "VIEWER") {
        return NextResponse.redirect(new URL(path.startsWith("/hardware") ? "/hardware" : "/vms", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path === "/login") return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vms/:path*",
    "/hardware/:path*",
    "/reports/:path*",
    "/imports/:path*",
    "/users/:path*",
    "/profile/:path*",
    "/audit-logs/:path*",
    "/notifications/:path*",
  ],
};
