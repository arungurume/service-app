import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

export const StatusLegend = () => {
  return (
    <div className="flex items-center justify-center space-x-6 py-4 border-t border-border bg-muted/30">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-status-up" />
        <span className="text-sm text-muted-foreground">UP</span>
      </div>
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-status-degraded" />
        <span className="text-sm text-muted-foreground">DEGRADED</span>
      </div>
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-status-down" />
        <span className="text-sm text-muted-foreground">DOWN</span>
      </div>
    </div>
  );
};