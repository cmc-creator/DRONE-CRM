import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const role = session?.user?.role;

  // Public routes
  const isPublicRoute =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/api/auth");

  if (isPublicRoute) {
    // Redirect logged-in users away from login page
    if (isLoggedIn && nextUrl.pathname === "/login") {
      const redirectTo = getRoleHome(role);
      return NextResponse.redirect(new URL(redirectTo, nextUrl));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Role-based access
  if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/pilot") && role !== "PILOT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/client") && role !== "CLIENT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl));
  }

  return NextResponse.next();
});

function getRoleHome(role?: string) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "PILOT":
      return "/pilot/dashboard";
    case "CLIENT":
      return "/client/dashboard";
    default:
      return "/login";
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
