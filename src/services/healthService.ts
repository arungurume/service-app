import { Service, ServiceStatus } from "@/types/service";

export interface HealthResponse {
  status: string;
}

// Accept baseUrl as a parameter
export const fetchServiceHealth = async (
  serviceId: string,
  baseUrl: string
): Promise<ServiceStatus> => {
  console.log(`Fetching health for service: ${serviceId}`);
  try {
    const response = await fetch(`${baseUrl}/actuator/health`, {
      method: "GET",
      credentials: "include", // important if backend sets cookies
    });

    if (!response.ok) {
      return "DOWN";
    }

    const data: HealthResponse = await response.json();

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

// Expect each service to have a baseUrl property
export const fetchAllServicesHealth = async (services: Service[]): Promise<Service[]> => {
  const healthChecks = services.map(async (service) => {
    // Use service.baseUrl for each request
    const status = await fetchServiceHealth(service.id, service.baseUrl);
    return {
      ...service,
      status,
      info: { lastChecked: new Date().toISOString() }
    };
  });

  return Promise.all(healthChecks);
};