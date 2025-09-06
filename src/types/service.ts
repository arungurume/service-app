export type ServiceStatus = "UP" | "DOWN" | "DEGRADED";

export interface Service {
  id: string;
  name: string;
  baseUrl: string;
  status: ServiceStatus;
  info: Record<string, any>;
}