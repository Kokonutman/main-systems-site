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

export function isHealthPayload(value: unknown): value is HealthPayload {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.status === "string" && typeof record.service === "string" && typeof record.timestamp === "string";
}

export function getStateFromHealth(health: HealthPayload): Exclude<ServiceState, "checking"> {
  if (health.status !== "ok") return "degraded";
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
