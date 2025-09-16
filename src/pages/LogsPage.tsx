import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { INITIAL_SERVICES } from "@/config/serviceConfig";

const LogsPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const service = INITIAL_SERVICES.find(s => s.id === serviceId);

  useEffect(() => {
    if (!service) return;

    let eventSource;
    setLogs([]); // Clear logs on new connection
    eventSource = new EventSource(
      `${import.meta.env.VITE_NODE_SERVER_BASE_URL || 'http://localhost:5000'}/api/service/${serviceId}/logs`
    );
    eventSource.addEventListener("message", (event) => {
      setLogs((prev) => [...prev, event.data].slice(-100)); // Keep last 100 logs
    });
    eventSource.addEventListener("error", (event) => {
      console.error("Log stream error:", event);
      eventSource.close();
    });

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [service, serviceId]);

  if (!service) {
    return <Navigate to="/404" replace />;
  }

  const handleRefresh = async () => {
    setIsLoading(true);
    // TODO: Fetch fresh logs from backend
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
    setIsLoading(false);
  };

  const handleDownload = () => {
    const logContent = logs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${serviceId}-logs-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log =>
    searchQuery === '' || log.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Service Logs</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{service.name}</Badge>
              <span className="text-sm text-muted-foreground">{service.id}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              Auto Refresh: {autoRefresh ? "ON" : "OFF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Live Logs</span>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-[34em] overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="text-muted-foreground">No logs available or no matches found.</div>
              ) : (
                filteredLogs.map((log, index) => (
                  <div key={index} className="mb-1 whitespace-pre-wrap">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
           {/* Placeholder for future content   
        <div className="text-center text-sm text-muted-foreground">
          <p>Real-time log streaming.</p>
        </div>*/} 
      </div>
    </div>
  );
};

export default LogsPage;