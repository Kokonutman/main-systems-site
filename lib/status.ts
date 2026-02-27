import { ServiceConfig } from "./services";

export type ServiceState = "online" | "degraded" | "offline" | "checking";

export type HealthPayload = {
  status: string;
  service: string;
  timestamp: string;
};

export type StatusEntry = {
  id: string;
  name: string;
  url: string;
  state: ServiceState;
  health?: HealthPayload;
  checkedAt: string;
  latencyMs: number | null;
  error?: string;
};

const STALE_MS = 5 * 60 * 1000;

export function isHealthPayload(value: unknown): value is HealthPayload {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.status === "string" && typeof record.service === "string" && typeof record.timestamp === "string";
}

export function getStateFromHealth(health: HealthPayload, nowMs: number): Exclude<ServiceState, "checking"> {
  if (health.status !== "ok") return "degraded";
  const ts = Date.parse(health.timestamp);
  if (!Number.isFinite(ts)) return "degraded";
  if (nowMs - ts > STALE_MS) return "degraded";
  return "online";
}

export function makeOffline(service: ServiceConfig, checkedAt: string, error: string): StatusEntry {
  return {
    id: service.id,
    name: service.name,
    url: service.url,
    state: "offline",
    checkedAt,
    latencyMs: null,
    error,
  };
}
