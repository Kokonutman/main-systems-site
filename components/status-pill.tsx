import { ServiceState } from "@/lib/status";

type StatusPillProps = {
  state: ServiceState;
};

const labelMap: Record<ServiceState, string> = {
  checking: "Checking",
  online: "Online",
  degraded: "Degraded",
  offline: "Offline",
};

const stateClasses: Record<ServiceState, string> = {
  checking: "border-slate-700 bg-slate-900 text-slate-300",
  online: "border-emerald-600/70 bg-emerald-900/30 text-emerald-300",
  degraded: "border-amber-700/70 bg-amber-900/30 text-amber-300",
  offline: "border-rose-700/70 bg-rose-900/30 text-rose-300",
};

export function StatusPill({ state }: StatusPillProps) {
  return (
    <span
      className={`inline-flex min-w-20 items-center justify-center rounded-full border px-2 py-1 text-xs font-medium ${stateClasses[state]}`}
      aria-live="polite"
    >
      {labelMap[state]}
    </span>
  );
}
