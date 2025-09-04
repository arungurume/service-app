import { XCircle, CheckCircle, AlertTriangle, FileText, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Service, ServiceStatus } from "@/types/service";

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRestart(service.id)}
            className="flex items-center gap-2 flex-1"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};