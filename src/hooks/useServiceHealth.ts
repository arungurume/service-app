import { useQuery } from "@tanstack/react-query";
import { Service } from "@/types/service";
import { fetchAllServicesHealth } from "@/services/healthService";

export const useServiceHealth = (initialServices: Service[]) => {
  return useQuery({
    queryKey: ["serviceHealth"],
    queryFn: () => fetchAllServicesHealth(initialServices),
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true,
    initialData: initialServices,
  });
};