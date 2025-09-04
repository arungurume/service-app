export type ServiceStatus = "UP" | "DOWN" | "DEGRADED";

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  info: Record<string, any>;
}

export const INITIAL_SERVICES: Service[] = [
  { id: "ums", name: "User Management (UMS)", status: "DOWN", info: {} },
  { id: "cms", name: "Content Management (CMS)", status: "DOWN", info: {} },
  { id: "oms", name: "Organization Management (OMS)", status: "DOWN", info: {} },
  { id: "ssms", name: "Socket.IO Server (SSMS)", status: "DOWN", info: {} },
  { id: "tms", name: "Template Management (TMS)", status: "DOWN", info: {} },
  { id: "eureka", name: "Eureka Server", status: "DOWN", info: {} },
];