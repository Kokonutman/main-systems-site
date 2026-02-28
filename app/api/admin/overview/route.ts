import { NextRequest, NextResponse } from "next/server";
import { getAdminOverview } from "@/lib/admin-overview";

export async function GET(request: NextRequest) {
  const force = request.nextUrl.searchParams.get("force") === "true";
  return NextResponse.json(await getAdminOverview(force));
}
