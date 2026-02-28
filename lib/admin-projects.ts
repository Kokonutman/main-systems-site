export type AdminEndpoint = {
  label: string;
  method: "GET" | "POST";
  path: string;
  auth: string;
  notes?: string;
};

export type AdminProject = {
  id: string;
  name: string;
  serviceId: string;
  url: string;
  repoFolder: string;
  runtime: string;
  summary: string;
  purpose: string;
  cron?: string;
  capabilities: string[];
  envDependencies: string[];
  endpoints: AdminEndpoint[];
};

export const adminProjects: AdminProject[] = [
  {
    id: "dining",
    name: "Dining",
    serviceId: "dining",
    url: "https://dining.arjun.systems",
    repoFolder: "../dining",
    runtime: "Node.js route handlers + scheduled Vercel cron",
    summary: "Daily digest pipeline for UMD dining data with signup, email delivery, and cron execution.",
    purpose: "Fetch menus, normalize records, score interesting items, group results, and send digest emails safely.",
    cron: "0 11 * * * -> GET /api/dining/run",
    capabilities: [
      "Health endpoint with readiness/degraded status",
      "Protected manual run endpoint with dryRun/debug/force/date controls",
      "Protected test-email endpoint",
      "Signup + unsubscribe flow for subscribers",
      "State-backed dedupe and recent-run lock",
    ],
    envDependencies: [
      "DINING_CRON_SECRET or CRON_SECRET",
      "DINING_TEST_EMAIL_SECRET",
      "RESEND_API_KEY",
      "DINING_EMAIL_TO / DINING_EMAIL_FROM",
      "Optional KV/Supabase state envs",
    ],
    endpoints: [
      {
        label: "Health",
        method: "GET",
        path: "/api/dining/health",
        auth: "None",
        notes: "Returns status, service, timestamp.",
      },
      {
        label: "Run digest",
        method: "GET",
        path: "/api/dining/run?dryRun=1&debug=1",
        auth: "Bearer DINING_CRON_SECRET or CRON_SECRET",
        notes: "Recent-run locked for 5 minutes unless force=1.",
      },
      {
        label: "Test email",
        method: "POST",
        path: "/api/dining/test-email",
        auth: "Bearer DINING_TEST_EMAIL_SECRET",
        notes: "Exercise email delivery separately from the daily run.",
      },
    ],
  },
  {
    id: "plate-calculator",
    name: "PlateLoader",
    serviceId: "plate-calculator",
    url: "https://plates.arjun.systems",
    repoFolder: "../plate calculator",
    runtime: "Next.js app + edge health endpoint",
    summary: "Workout plate planning tool that optimizes exact per-set stacks and transitions.",
    purpose: "Compute exact plate combinations, transition instructions, and total plate moves across a workout.",
    capabilities: [
      "Exact representability checks for each set",
      "Dynamic-programming optimization across full workout sequence",
      "Practical mode vs true-optimal mode",
      "Deterministic transition instructions using longest common prefix",
    ],
    envDependencies: ["None required for core tool"],
    endpoints: [
      {
        label: "Health",
        method: "GET",
        path: "/api/health",
        auth: "None",
        notes: "Simple edge health check with ok timestamp.",
      },
      {
        label: "Main app",
        method: "GET",
        path: "/",
        auth: "None",
        notes: "Calculator UI is served from the homepage.",
      },
    ],
  },
];
