"use client";

import { useCallback, useEffect, useState } from "react";
import { ServiceCard } from "@/components/service-card";
import { StatusTable } from "@/components/status-table";
import { services } from "@/lib/services";
import { StatusEntry } from "@/lib/status";

const POLL_INTERVAL_MS = 30_000;

type StatusApiResponse = {
  checkedAt: string;
  services: StatusEntry[];
};

function relativeTime(value: string | null): string {
  if (!value) return "never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function StatusDashboard() {
  const [statusById, setStatusById] = useState<Record<string, StatusEntry>>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (force = false) => {
    setIsFetching(true);
    setApiError(null);
    try {
      const response = await fetch(`/api/status${force ? "?force=true" : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Status API error: ${response.status}`);
      const payload = (await response.json()) as StatusApiResponse;
      const next: Record<string, StatusEntry> = {};
      for (const entry of payload.services) next[entry.id] = entry;
      setStatusById(next);
      setLastUpdated(payload.checkedAt);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Status unavailable");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (document.visibilityState === "visible") {
          void fetchStatus();
        }
      }, POLL_INTERVAL_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchStatus();
        start();
      } else if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchStatus]);

  const updatedLabel = relativeTime(lastUpdated);

  return (
    <>
      {apiError ? (
        <div className="mb-6 rounded-xl border border-rose-800/70 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          Status unavailable. Tool links are still usable.
        </div>
      ) : null}

      <section id="tools" className="scroll-mt-20 py-6">
        <div className="mb-4">
          <h2 className="text-sm uppercase tracking-[0.18em] text-slate-400">Tools</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} status={statusById[service.id]} />
          ))}
        </div>
      </section>

      <section id="status" className="scroll-mt-20 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm uppercase tracking-[0.18em] text-slate-400">Status</h2>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>Last updated: {updatedLabel}</span>
            <button
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition-colors hover:border-emerald-500 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => void fetchStatus(true)}
              disabled={isFetching}
            >
              {isFetching ? "Checking..." : "Recheck now"}
            </button>
          </div>
        </div>
        <StatusTable services={services} statusById={statusById} />
      </section>
    </>
  );
}
