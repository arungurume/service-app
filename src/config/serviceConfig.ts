import { Service } from "@/types/service";

// Use import.meta.env for Vite, process.env for CRA
export const INITIAL_SERVICES: Service[] = [
  {
    id: "ums",
    name: "User Management (UMS)",
    baseUrl: import.meta.env.VITE_UMS_BASE_URL || "http://localhost:9001/ums",
    status: "DOWN",
    info: {}
  },
  {
    id: "cms",
    name: "Content Management (CMS)",
    baseUrl: import.meta.env.VITE_CMS_BASE_URL || "http://localhost:9002/cms",
    status: "DOWN",
    info: {}
  },
  {
    id: "oms",
    name: "Organization Management (OMS)",
    baseUrl: import.meta.env.VITE_OMS_BASE_URL || "http://localhost:9003/oms",
    status: "DOWN",
    info: {}
  },
  {
    id: "ssms",
    name: "Socket.IO Server (SSMS)",
    baseUrl: import.meta.env.VITE_SSMS_BASE_URL || "http://localhost:9006",
    status: "DOWN",
    info: {}
  },
  {
    id: "tms",
    name: "Template Management (TMS)",
    baseUrl: import.meta.env.VITE_TMS_BASE_URL || "http://localhost:9005/tms",
    status: "DOWN",
    info: {}
  },
  {
    id: "eureka",
    name: "Eureka Server",
    baseUrl: import.meta.env.VITE_EUREKA_BASE_URL || "http://localhost:8761",
    status: "DOWN",
    info: {}
  },
];
