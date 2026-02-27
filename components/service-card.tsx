import { StatusPill } from "@/components/status-pill";
import { ServiceConfig } from "@/lib/services";
import { StatusEntry } from "@/lib/status";

type ServiceCardProps = {
  service: ServiceConfig;
  status?: StatusEntry;
};

function formatTimestamp(value: string | undefined): string {
  if (!value) return "No timestamp";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid timestamp";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function ServiceCard({ service, status }: ServiceCardProps) {
  const state = status?.state ?? "checking";
  const checked = status?.checkedAt ? formatTimestamp(status.checkedAt) : "Pending";
  const healthTime = formatTimestamp(status?.health?.timestamp);

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 shadow-sm shadow-black/30">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100">{service.name}</h3>
        <StatusPill state={state} />
      </header>
      <p className="mb-4 text-sm leading-6 text-slate-300">{service.description}</p>
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-400">
        <span>Checked: {checked}</span>
        <span>Health ts: {healthTime}</span>
        <span>Latency: {status?.latencyMs != null ? `${status.latencyMs}ms` : "N/A"}</span>
      </div>
      <a
        className="inline-flex rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition-colors hover:border-emerald-500 hover:text-emerald-300"
        href={service.url}
        target="_blank"
        rel="noreferrer"
      >
        Open tool
      </a>
    </article>
  );
}
