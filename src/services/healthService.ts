import { Service, ServiceStatus } from "@/types/service";

const BASE_URL = "http://localhost:9001";

export interface HealthResponse {
  status: string;
}

export const fetchServiceHealth = async (serviceId: string): Promise<ServiceStatus> => {
  try {
    const response = await fetch(`${BASE_URL}/${serviceId}/actuator/health`);
    
    if (!response.ok) {
      return "DOWN";
    }
    
    const data: HealthResponse = await response.json();
    
    // Map API response status to our ServiceStatus
    switch (data.status?.toUpperCase()) {
      case "UP":
        return "UP";
      case "DEGRADED":
        return "DEGRADED";
      default:
        return "DOWN";
    }
  } catch (error) {
    console.error(`Failed to fetch health for ${serviceId}:`, error);
    return "DOWN";
  }
};

export const fetchAllServicesHealth = async (services: Service[]): Promise<Service[]> => {
  const healthChecks = services.map(async (service) => {
    const status = await fetchServiceHealth(service.id);
    return {
      ...service,
      status,
      info: { lastChecked: new Date().toISOString() }
    };
  });
  
  return Promise.all(healthChecks);
};