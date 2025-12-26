import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🍪 cookies
  const token = request.cookies.get("access_token")?.value;
  const isVerified = request.cookies.get("is_verified")?.value === "true";
  const role = request.cookies.get("role")?.value;

  /* ---------------- ROUTE GROUPS ---------------- */

  // Truly public routes
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/confirm-password",
  ];

  const dashboardRoute = "/dashboard";
  const adminRoute = "/admin";

  const isPublicRoute = publicRoutes.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  const isDashboardRoute = pathname.startsWith(dashboardRoute);
  const isAdminRoute = pathname.startsWith(adminRoute);

  /* =================================================
     1️⃣ NOT LOGGED IN
  ================================================= */
  if (!token) {
    // ❌ block protected areas
    if (!isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // ✅ allow public routes
    return NextResponse.next();
  }

  /* =================================================
     2️⃣ LOGGED IN BUT OTP NOT VERIFIED
  ================================================= */
  if (token && !isVerified) {
    // ❌ block dashboard/admin
    if (isDashboardRoute || isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/register"; // continue multi-step flow
      return NextResponse.redirect(url);
    }

    // ✅ allow public routes (login/register included)
    return NextResponse.next();
  }

  /* =================================================
     3️⃣ LOGGED IN & VERIFIED
  ================================================= */
  if (token && isVerified) {
    // ❌ prevent access to auth pages (even though they are public)
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // ❌ admin guard
    if (isAdminRoute && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/* ---------------- MATCHER ---------------- */
export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
