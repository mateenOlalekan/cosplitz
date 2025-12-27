import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🍪 cookies (edge hint only)
  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("role")?.value;

  /* ================= ROUTE GROUPS ================= */

  // Public (no auth required)
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/confirm-password",
    "/verify-otp",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isUserRoute = pathname.startsWith("/user");
  const isAdminRoute = pathname.startsWith("/admin");

  /* =================================================
     1️⃣ NOT AUTHENTICATED
  ================================================= */
  if (!token) {
    if (isUserRoute || isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  /* =================================================
     2️⃣ AUTHENTICATED USERS
  ================================================= */

  // ❌ prevent logged-in users from auth pages
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = role === "admin"
      ? "/admin/dashboard"
      : "/user/dashboard";
    return NextResponse.redirect(url);
  }

  // ❌ admin URL protection
  if (isAdminRoute && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/* ================= MATCHER ================= */
export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
