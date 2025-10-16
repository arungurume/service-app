import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ServiceCard } from "@/components/dashboard/ServiceCard";
import { StatusLegend } from "@/components/dashboard/StatusLegend";
import { useToast } from "@/hooks/use-toast";
import { useServiceHealth } from "@/hooks/useServiceHealth";
import { INITIAL_SERVICES } from "@/config/serviceConfig";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { data: services, refetch, isLoading } = useServiceHealth(INITIAL_SERVICES);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    toast({
      title: "Refreshing services...",
      description: "Service status is being updated.",
    });
    refetch();
  };

  const handleViewLogs = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    const logsUrl = `/logs/${serviceId}`;
    window.open(logsUrl, '_blank');
    toast({
      title: `Opening logs for ${service?.name}`,
      description: "Logs opened in new tab",
    });
  };

  const handleRestart = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    toast({
      title: `Restarting ${service?.name}`,
      description: "Service restart initiated...",
    });
  };

  return (
    <>
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
      />
      
      <main className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewLogs={handleViewLogs}
              onRestart={handleRestart}
            />
          ))}
        </div>
        
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services match your search criteria.</p>
          </div>
        )}
        
        <StatusLegend />
        
        <footer className="text-center py-4 text-sm text-muted-foreground border-t border-border">
          Services are monitored every 30 seconds. Connect restart and logs functionality as needed.
        </footer>
      </main>
    </>
  );
};

export default Index;