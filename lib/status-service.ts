import { services } from "@/lib/services";
import { getStateFromHealth, isHealthPayload, makeOffline, StatusEntry } from "@/lib/status";

export type StatusApiResponse = {
  checkedAt: string;
  services: StatusEntry[];
};

const CACHE_TTL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 23_000;

let cache: { expiresAt: number; value: StatusApiResponse } | null = null;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkOne(service: (typeof services)[number], checkedAt: string): Promise<StatusEntry> {
  const startedAt = Date.now();

  try {
    const response = await fetchWithTimeout(service.healthUrl);
    const latencyMs = Date.now() - startedAt;

    if (!response.ok) {
      return makeOffline(service, checkedAt, `HTTP ${response.status}`);
    }

    const payloadUnknown: unknown = await response.json();
    if (!isHealthPayload(payloadUnknown)) {
      return makeOffline(service, checkedAt, "Invalid health payload");
    }

    return {
      id: service.id,
      name: service.name,
      url: service.url,
      state: getStateFromHealth(payloadUnknown),
      health: payloadUnknown,
      checkedAt,
      latencyMs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return makeOffline(service, checkedAt, message);
  }
}

export async function getServiceStatuses(force = false): Promise<StatusApiResponse> {
  const now = Date.now();

  if (!force && cache && now < cache.expiresAt) {
    return cache.value;
  }

  const checkedAt = new Date(now).toISOString();

  try {
    const results = await Promise.all(services.map((service) => checkOne(service, checkedAt)));
    const responsePayload: StatusApiResponse = { checkedAt, services: results };
    cache = { value: responsePayload, expiresAt: now + CACHE_TTL_MS };
    return responsePayload;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Aggregator failed";
    return {
      checkedAt,
      services: services.map((service) => makeOffline(service, checkedAt, message)),
    };
  }
}
