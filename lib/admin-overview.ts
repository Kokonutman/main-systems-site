import { adminProjects } from "@/lib/admin-projects";
import { getDiningSubscribers } from "@/lib/dining-subscribers";
import { getServiceStatuses } from "@/lib/status-service";

export type AdminProjectOverview = (typeof adminProjects)[number] & {
  status: Awaited<ReturnType<typeof getServiceStatuses>>["services"][number] | null;
};

export type AdminOverviewResponse = {
  generatedAt: string;
  projects: AdminProjectOverview[];
  diningSubscribers: {
    subscribers: Awaited<ReturnType<typeof getDiningSubscribers>>["subscribers"];
    warning?: string;
  };
};

export async function getAdminOverview(force = false): Promise<AdminOverviewResponse> {
  const [statusResponse, diningSubscribers] = await Promise.all([getServiceStatuses(force), getDiningSubscribers()]);
  const byId = new Map(statusResponse.services.map((service) => [service.id, service]));

  return {
    generatedAt: statusResponse.checkedAt,
    projects: adminProjects.map((project) => ({
      ...project,
      status: byId.get(project.serviceId) ?? null,
    })),
    diningSubscribers,
  };
}
