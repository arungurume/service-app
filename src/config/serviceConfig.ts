import { Service } from "@/types/service";

// Use import.meta.env for Vite, process.env for CRA
export const INITIAL_SERVICES: Service[] = [
  {
    id: "eureka",
    name: "Eureka Server",
    baseUrl: import.meta.env.VITE_EUREKA_BASE_URL || "http://localhost:8761",
    status: "UP",
    info: {}
  },
  {
    id: "ums",
    name: "User Management (UMS)",
    baseUrl: import.meta.env.VITE_UMS_BASE_URL || "http://localhost:9001/ums",
    status: "UP",
    info: {}
  },
  {
    id: "oms",
    name: "Organization Management (OMS)",
    baseUrl: import.meta.env.VITE_OMS_BASE_URL || "http://localhost:9003/oms",
    status: "UP",
    info: {}
  },
  {
    id: "cms",
    name: "Content Management (CMS)",
    baseUrl: import.meta.env.VITE_CMS_BASE_URL || "http://localhost:9002/cms",
    status: "UP",
    info: {}
  },
  {
    id: "tms",
    name: "Template Management (TMS)",
    baseUrl: import.meta.env.VITE_TMS_BASE_URL || "http://localhost:9005/tms",
    status: "UP",
    info: {}
  },
  {
    id: "sms",
    name: "Web-Socket/Socket.IO Server (SMS)",
    baseUrl: import.meta.env.VITE_SMS_BASE_URL || "http://localhost:9006",
    status: "UP",
    info: {}
  },
  {
    id: "sample",
    name: "Sample Dshub Service",
    baseUrl: import.meta.env.VITE_SAMPLE_BASE_URL || "http://localhost:9999",
    status: "UP",
    info: {}
  },
  {
    id: "ans",
    name: "API Node Server (ANS)",
    baseUrl: import.meta.env.VITE_NODE_SERVER_BASE_URL || "http://localhost:5000",
    status: "UP",
    info: {}
  },


];
