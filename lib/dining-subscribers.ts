export type DiningSubscriber = {
  email: string;
  createdAt: string;
};

export type DiningSubscribersResult = {
  subscribers: DiningSubscriber[];
  warning?: string;
};

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    url: url.replace(/\/+$/, ""),
    serviceRoleKey,
  };
}

async function supabaseRequest(pathAndQuery: string, init: RequestInit): Promise<Response> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  return fetch(`${config.url}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function getDiningSubscribers(): Promise<DiningSubscribersResult> {
  if (!getSupabaseConfig()) {
    return {
      subscribers: [],
      warning: "SUPABASE_NOT_CONFIGURED",
    };
  }

  try {
    const response = await supabaseRequest(
      "dining_subscribers?select=email,created_at&order=created_at.desc",
      { method: "GET" },
    );

    if (!response.ok) {
      return {
        subscribers: [],
        warning: "STATE_SUBSCRIBERS_READ_FAILED",
      };
    }

    const rows = (await response.json()) as Array<{ email: string; created_at: string }>;

    return {
      subscribers: rows.map((row) => ({
        email: row.email,
        createdAt: row.created_at,
      })),
    };
  } catch {
    return {
      subscribers: [],
      warning: "STATE_SUBSCRIBERS_READ_FAILED",
    };
  }
}
