import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionValue } from "@/lib/admin-auth-core";

export {
  ADMIN_SESSION_COOKIE,
  createAdminSessionValue,
  getAdminCookieOptions,
  hasAdminPasswordConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth-core";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSessionValue(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}
