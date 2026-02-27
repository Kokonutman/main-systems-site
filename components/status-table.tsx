import { StatusPill } from "@/components/status-pill";
import { ServiceConfig } from "@/lib/services";
import { StatusEntry } from "@/lib/status";

type StatusTableProps = {
  services: ServiceConfig[];
  statusById: Record<string, StatusEntry>;
};

function formatDateTime(value: string | undefined): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid";
  return date.toLocaleString(undefined, { hour12: false });
}

export function StatusTable({ services, statusById }: StatusTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full min-w-[720px] border-collapse bg-slate-950/70 text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="border-b border-slate-800 px-4 py-3">Service</th>
            <th className="border-b border-slate-800 px-4 py-3">Status</th>
            <th className="border-b border-slate-800 px-4 py-3">Health timestamp</th>
            <th className="border-b border-slate-800 px-4 py-3">Checked at</th>
            <th className="border-b border-slate-800 px-4 py-3">Latency</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => {
            const row = statusById[service.id];
            return (
              <tr key={service.id}>
                <td className="border-b border-slate-800 px-4 py-3 text-slate-100 last:border-b-0">
                  <a className="hover:text-emerald-300" href={service.url} target="_blank" rel="noreferrer">
                    {service.name}
                  </a>
                </td>
                <td className="border-b border-slate-800 px-4 py-3 last:border-b-0">
                  <StatusPill state={row?.state ?? "checking"} />
                </td>
                <td className="border-b border-slate-800 px-4 py-3 text-slate-300 last:border-b-0">
                  {formatDateTime(row?.health?.timestamp)}
                </td>
                <td className="border-b border-slate-800 px-4 py-3 text-slate-300 last:border-b-0">
                  {formatDateTime(row?.checkedAt)}
                </td>
                <td className="border-b border-slate-800 px-4 py-3 text-slate-300 last:border-b-0">
                  {row?.latencyMs != null ? `${row.latencyMs}ms` : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
