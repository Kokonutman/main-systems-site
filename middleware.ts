import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from "@/lib/admin-auth-core";

function isProtectedAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

function isPublicAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname === "/admin/login" || pathname === "/api/admin/login";
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedAdminPath(pathname) || isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const isAuthed = await verifyAdminSessionValue(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (isAuthed) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const loginUrl = new URL("/admin", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
