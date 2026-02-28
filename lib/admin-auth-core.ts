export const ADMIN_SESSION_COOKIE = "arjun_systems_admin";

function encoder() {
  return new TextEncoder();
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeSecret(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder().encode(value));
  return toHex(new Uint8Array(digest));
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder().encode(value));
  return toHex(new Uint8Array(signature));
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

export function hasAdminPasswordConfigured(): boolean {
  return normalizeSecret(process.env.ADMIN_PANEL_PASSWORD) !== null;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const expected = normalizeSecret(process.env.ADMIN_PANEL_PASSWORD);
  if (!expected) return false;

  const [expectedHash, actualHash] = await Promise.all([sha256(expected), sha256(password)]);
  return constantTimeEquals(expectedHash, actualHash);
}

function getSessionSecret(): string | null {
  return normalizeSecret(process.env.ADMIN_PANEL_SESSION_SECRET) ?? normalizeSecret(process.env.ADMIN_PANEL_PASSWORD);
}

export async function createAdminSessionValue(): Promise<string | null> {
  const secret = getSessionSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const payload = `admin:${expiresAt}`;
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionValue(value: string | null | undefined): Promise<boolean> {
  if (!value) return false;

  const secret = getSessionSecret();
  if (!secret) return false;

  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return false;

  const payload = value.slice(0, lastDot);
  const providedSignature = value.slice(lastDot + 1);
  const expectedSignature = await hmac(payload, secret);

  if (!constantTimeEquals(providedSignature, expectedSignature)) {
    return false;
  }

  const [, expiresAtRaw] = payload.split(":");
  const expiresAt = Number(expiresAtRaw);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}
