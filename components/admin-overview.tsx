"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/status-pill";
import { type AdminOverviewResponse } from "@/lib/admin-overview";

type AdminOverviewProps = {
  initialData: AdminOverviewResponse;
};

function formatDateTime(value: string | undefined): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid";
  return date.toLocaleString(undefined, { hour12: false });
}

function relativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function AdminOverview({ initialData }: AdminOverviewProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const summary = useMemo(() => {
    const total = data.projects.length;
    const online = data.projects.filter((project) => project.status?.state === "online").length;
    const degraded = data.projects.filter((project) => project.status?.state === "degraded").length;
    const offline = data.projects.filter((project) => project.status?.state === "offline").length;
    return { total, online, degraded, offline };
  }, [data]);

  async function refresh(force = true) {
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      const response = await fetch(`/api/admin/overview${force ? "?force=true" : ""}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Overview refresh failed: ${response.status}`);
      }
      const payload = (await response.json()) as AdminOverviewResponse;
      setData(payload);
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function logout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Projects</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100">{summary.total}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Online</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-300">{summary.online}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Degraded</div>
          <div className="mt-2 text-2xl font-semibold text-amber-300">{summary.degraded}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Offline</div>
          <div className="mt-2 text-2xl font-semibold text-rose-300">{summary.offline}</div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Overview</h2>
            <p className="mt-1 text-sm text-slate-400">Generated {relativeTime(data.generatedAt)}.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void refresh(true)}
              disabled={isRefreshing}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition-colors hover:border-emerald-500 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh now"}
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={isLoggingOut}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition-colors hover:border-rose-500 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
        {refreshError ? <p className="mt-3 text-sm text-rose-300">{refreshError}</p> : null}
      </section>

      <section className="space-y-5">
        {data.projects.map((project) => (
          <article key={project.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-slate-100">{project.name}</h3>
                  <StatusPill state={project.status?.state ?? "checking"} />
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{project.summary}</p>
                <p className="mt-2 text-sm text-slate-400">{project.purpose}</p>
              </div>
              <div className="text-sm text-slate-400">
                <div>Repo: <code>{project.repoFolder}</code></div>
                <div className="mt-1">Runtime: {project.runtime}</div>
                {project.cron ? <div className="mt-1">Cron: {project.cron}</div> : null}
                <div className="mt-1">
                  URL:{" "}
                  <a className="text-emerald-300 hover:text-emerald-200" href={project.url} target="_blank" rel="noreferrer">
                    {project.url}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr]">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h4 className="text-sm font-medium text-slate-200">Live status</h4>
                <dl className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-300 sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Health service</dt>
                    <dd>{project.status?.health?.service ?? "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Reported status</dt>
                    <dd>{project.status?.health?.status ?? "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Health timestamp</dt>
                    <dd>{formatDateTime(project.status?.health?.timestamp)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Checked at</dt>
                    <dd>{formatDateTime(project.status?.checkedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Latency</dt>
                    <dd>{project.status?.latencyMs != null ? `${project.status.latencyMs}ms` : "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Error</dt>
                    <dd>{project.status?.error ?? "None"}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h4 className="text-sm font-medium text-slate-200">Environment dependencies</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {project.envDependencies.map((dependency) => (
                    <li key={dependency}>{dependency}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h4 className="text-sm font-medium text-slate-200">Capabilities</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {project.capabilities.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <h4 className="text-sm font-medium text-slate-200">Endpoints</h4>
                <div className="mt-3 space-y-3">
                  {project.endpoints.map((endpoint) => (
                    <div key={`${project.id}-${endpoint.path}`} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-slate-700 px-2 py-0.5 text-xs text-slate-300">{endpoint.method}</span>
                        <span className="font-medium text-slate-100">{endpoint.label}</span>
                      </div>
                      <div className="mt-2 font-mono text-xs text-emerald-300">{endpoint.path}</div>
                      <div className="mt-2 text-slate-400">Auth: {endpoint.auth}</div>
                      {endpoint.notes ? <div className="mt-1 text-slate-400">{endpoint.notes}</div> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {project.id === "dining" ? (
              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-slate-200">Subscribers</h4>
                  <p className="mt-1 text-xs text-slate-400">Read-only view of `public.dining_subscribers` from Supabase.</p>
                </div>

                {data.diningSubscribers.warning ? (
                  <div className="mb-3 rounded-lg border border-amber-800/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
                    Subscriber data unavailable: {data.diningSubscribers.warning}
                  </div>
                ) : null}

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full min-w-[420px] border-collapse bg-slate-950/40 text-xs">
                    <thead>
                      <tr className="text-left uppercase tracking-[0.14em] text-slate-500">
                        <th className="border-b border-slate-800 px-3 py-2">Email</th>
                        <th className="border-b border-slate-800 px-3 py-2">Signed up</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.diningSubscribers.subscribers.length > 0 ? (
                        data.diningSubscribers.subscribers.map((subscriber) => (
                          <tr key={`${subscriber.email}-${subscriber.createdAt}`}>
                            <td className="border-b border-slate-800 px-3 py-2 font-mono text-[11px] text-slate-200 last:border-b-0">
                              {subscriber.email}
                            </td>
                            <td className="border-b border-slate-800 px-3 py-2 text-slate-300 last:border-b-0">
                              {formatDateTime(subscriber.createdAt)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-slate-400" colSpan={2}>
                            No subscriber rows available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
