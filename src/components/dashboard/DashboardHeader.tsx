import { Search, RefreshCw, Database, LogOut, Grid3X3, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
}

export const DashboardHeader = ({ searchQuery, onSearchChange, onRefresh }: DashboardHeaderProps) => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };
  return (
    <header className="bg-dashboard-header border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
              <Database className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">DShub Microservices (Mock)</h1>
              <p className="text-sm text-dashboard-subtitle">UMS • CMS • OMS • SSMS • TMS • Eureka</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {location.pathname !== '/dshub/users' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}
            {location.pathname !== '/dshub/users' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            )}
            
            {/* Navigation Tabs */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={location.pathname === '/' ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Services
              </Button>
              <Button
                variant={location.pathname === '/dshub/users' ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate('/dshub/users')}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Users
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};