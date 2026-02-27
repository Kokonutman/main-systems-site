export type ServiceConfig = {
  id: string;
  name: string;
  description: string;
  url: string;
  healthUrl: string;
  tags?: string[];
};

export const services: ServiceConfig[] = [
  {
    id: "plate-calculator",
    name: "PlateLoader",
    description: "Minimum plate changes + loading plan visualizer.",
    url: "https://plates.arjun.systems",
    healthUrl: "https://plates.arjun.systems/api/health",
    tags: ["tool", "calc"],
  },
  {
    id: "dining",
    name: "Dining",
    description: "Daily menu digest + UMD dining endpoints.",
    url: "https://dining.arjun.systems",
    healthUrl: "https://dining.arjun.systems/api/dining/health",
    tags: ["tool", "digest"],
  },
];
