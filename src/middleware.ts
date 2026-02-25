import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "lumin-aerial-crm-super-secret-key-2026"
);

function getRoleHome(role?: string) {
  switch (role) {
    case "ADMIN": return "/admin/dashboard";
    case "PILOT": return "/pilot/dashboard";
    case "CLIENT": return "/client/dashboard";
    default: return "/login";
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes — always allow
  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/unauthorized" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  // Get session token from cookie (NextAuth v5 cookie names)
  const token =
    req.cookies.get("authjs.session-token")?.value ??
    req.cookies.get("__Secure-authjs.session-token")?.value;

  let role: string | undefined;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      role = payload.role as string;
    } catch {
      // Invalid/expired token — treat as logged out
    }
  }

  const isLoggedIn = !!role;

  if (isPublic) {
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL(getRoleHome(role), req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/pilot") && role !== "PILOT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/client") && role !== "CLIENT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
