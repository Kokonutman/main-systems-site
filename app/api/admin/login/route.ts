import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionValue, getAdminCookieOptions, hasAdminPasswordConfigured, verifyAdminPassword, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const wantsJson = contentType.includes("application/json");

  const loginUrl = new URL("/admin", request.url);

  if (!hasAdminPasswordConfigured()) {
    if (wantsJson) {
      return NextResponse.json({ error: "ADMIN_PASSWORD_NOT_CONFIGURED" }, { status: 503 });
    }
    loginUrl.searchParams.set("error", "missing_password");
    return NextResponse.redirect(loginUrl);
  }

  let password = "";
  let nextPath = "/admin/panel";

  if (wantsJson) {
    const body = (await request.json()) as { password?: string; next?: string };
    password = body.password?.trim() ?? "";
    nextPath = body.next?.startsWith("/") ? body.next : "/admin/panel";
  } else {
    const formData = await request.formData();
    password = String(formData.get("password") ?? "").trim();
    const formNext = String(formData.get("next") ?? "/admin/panel");
    nextPath = formNext.startsWith("/") ? formNext : "/admin/panel";
  }

  const isValid = await verifyAdminPassword(password);
  if (!isValid) {
    if (wantsJson) {
      return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 401 });
    }
    loginUrl.searchParams.set("next", nextPath);
    loginUrl.searchParams.set("error", "invalid_password");
    return NextResponse.redirect(loginUrl);
  }

  const sessionValue = await createAdminSessionValue();
  if (!sessionValue) {
    if (wantsJson) {
      return NextResponse.json({ error: "ADMIN_PASSWORD_NOT_CONFIGURED" }, { status: 503 });
    }
    loginUrl.searchParams.set("error", "missing_password");
    return NextResponse.redirect(loginUrl);
  }

  const response = wantsJson
    ? NextResponse.json({ ok: true, next: nextPath })
    : NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, sessionValue, getAdminCookieOptions());
  return response;
}
