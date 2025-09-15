import { XCircle, CheckCircle, AlertTriangle, FileText, RotateCcw, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Service, ServiceStatus } from "@/types/service";
import React, { useState } from "react";

interface ServiceCardProps {
  service: Service;
  onViewLogs: (serviceId: string) => void;
  onRestart: (serviceId: string) => void;
}

const getStatusIcon = (status: ServiceStatus) => {
  switch (status) {
    case "UP":
      return <CheckCircle className="w-5 h-5 text-status-up" />;
    case "DEGRADED":
      return <AlertTriangle className="w-5 h-5 text-status-degraded" />;
    case "DOWN":
      return <XCircle className="w-5 h-5 text-status-down" />;
    default:
      return <XCircle className="w-5 h-5 text-status-down" />;
  }
};

const getStatusBadgeVariant = (status: ServiceStatus) => {
  switch (status) {
    case "UP":
      return "success";
    case "DEGRADED":
      return "warning";
    case "DOWN":
      return "destructive";
    default:
      return "destructive";
  }
};

export const ServiceCard = ({ service, onViewLogs, onRestart }: ServiceCardProps) => {
  const NODE_SERVER_BASE_URL = import.meta.env.VITE_NODE_SERVER_BASE_URL;
  const [isRestarting, setIsRestarting] = useState(false);
  const [dotCount, setDotCount] = useState(1);
  const [isStarting, setIsStarting] = useState(false);
  const [dotCountStart, setDotCountStart] = useState(1);

  // Animate dots for Restarting...
  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRestarting) {
      interval = setInterval(() => {
        setDotCount((prev) => (prev === 3 ? 1 : prev + 1));
      }, 500);
    } else {
      setDotCount(1);
    }
    return () => interval && clearInterval(interval);
  }, [isRestarting]);

  // Animate dots for Starting...
  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isStarting) {
      interval = setInterval(() => {
        setDotCountStart((prev) => (prev === 3 ? 1 : prev + 1));
      }, 500);
    } else {
      setDotCountStart(1);
    }
    return () => interval && clearInterval(interval);
  }, [isStarting]);

  // Function to handle restart API call
  const handleRestartClick = async () => {
    setIsRestarting(true);
    try {
      const response = await fetch(`${NODE_SERVER_BASE_URL}/api/service/${service.id}/restart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Failed to restart service");
      } else {
        alert("Service restart initiated");
      }
    } catch (err) {
      alert("Network error");
    }
    setIsRestarting(false);
    onRestart(service.id);
  };

  // Function to handle start API call
  const handleStartClick = async () => {
    setIsStarting(true);
    try {
      const response = await fetch(`${NODE_SERVER_BASE_URL}/api/service/${service.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Failed to start service");
      } else {
        alert("Service start initiated");
      }
    } catch (err) {
      alert("Network error");
    }
    setIsStarting(false);
    onRestart(service.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(service.status)}
            <div>
              <h3 className="font-medium text-foreground">{service.name}</h3>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(service.status)}>
            {service.status}
          </Badge>
        </div>
        {/* Base URL field with open link icon */}
        <div className="flex items-center mb-4">
          <span className="text-xs text-muted-foreground break-all">{service.baseUrl}</span>
          <a
            href={service.baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-primary hover:text-primary/80"
            title="Open service URL"
          >
            <ExternalLink className="w-4 h-4 inline text-muted-foreground" />
          </a>
        </div>
        {service.id === "ans" && (
          <div className="mb-4 p-2 border rounded bg-muted">
            <span className="font-semibold">Remark:</span> 
            <span className="text-xs text-muted-foreground">
              This service should be Up in order for other services to start and restart functionality.
            </span>
          </div>
        )}
        {service.id !== "ans" && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewLogs(service.id)}
              className="flex items-center gap-2 flex-1"
            >
              <FileText className="w-4 h-4" />
              View Logs
            </Button>
            {service.status === "DOWN" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartClick}
                disabled={isStarting}
                className="flex items-center gap-2 flex-1"
              >
                <RotateCcw className="w-4 h-4" />
                {isStarting ? `Starting${'.'.repeat(dotCountStart)}` : "Start"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestartClick}
                disabled={isRestarting}
                className="flex items-center gap-2 flex-1"
              >
                <RotateCcw className="w-4 h-4" />
                {isRestarting ? `Restarting${'.'.repeat(dotCount)}` : "Restart"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};