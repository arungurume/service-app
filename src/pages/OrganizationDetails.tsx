import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Location {
  id: number | string;
  name?: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactNumber?: string;
  timezone?: string;
  default?: boolean;
}

interface User {
  id: number | string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

interface Screen {
  id: number | string;
  name?: string;
  location?: string;
  status?: string;
  resolution?: string;
}

interface Playlist {
  id: number | string;
  name?: string;
  duration?: string;
  items?: number;
  status?: string;
}

interface Schedule {
  id: number | string;
  name?: string;
  startDate?: string;
  endDate?: string;
  screens?: number;
  status?: string;
}

interface Organization {
  id: number | string;
  name?: string;
  address?: string;
  contactEmailId?: string;
  contactNumber?: string;
  locations?: Location[];
  users?: User[];
  screens?: Screen[];
  playlists?: Playlist[];
  schedules?: Schedule[];
}

const OrganizationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchOrgDetails = async () => {
      setIsLoading(true);
      // Mock data for now
      setOrg({
        id: id || "",
        name: `Organization ${id}`,
        address: "123 Business Street, City, State 12345",
        contactEmailId: "contact@org.com",
        contactNumber: "+1234567890",
        locations: [
          { id: 1, name: "Main Office", address: "123 Main St", contactPerson: "John Doe", contactEmail: "john@org.com", contactNumber: "123-456-7890", timezone: "UTC", default: true },
          { id: 2, name: "Branch Office", address: "456 Branch Ave", contactPerson: "Jane Smith", contactEmail: "jane@org.com", contactNumber: "098-765-4321", timezone: "UTC", default: false },
        ],
        users: [
          { id: 1, name: "John Doe", email: "john@org.com", role: "Admin", status: "Active" },
          { id: 2, name: "Jane Smith", email: "jane@org.com", role: "User", status: "Active" },
          { id: 3, name: "Bob Johnson", email: "bob@org.com", role: "User", status: "Inactive" },
        ],
        screens: [
          { id: 1, name: "Lobby Screen", location: "Main Office", status: "Online", resolution: "1920x1080" },
          { id: 2, name: "Conference Room", location: "Main Office", status: "Online", resolution: "3840x2160" },
          { id: 3, name: "Reception", location: "Branch Office", status: "Offline", resolution: "1920x1080" },
        ],
        playlists: [
          { id: 1, name: "Morning Playlist", duration: "2h 30m", items: 15, status: "Active" },
          { id: 2, name: "Afternoon Playlist", duration: "3h 15m", items: 20, status: "Active" },
          { id: 3, name: "Evening Playlist", duration: "1h 45m", items: 10, status: "Inactive" },
        ],
        schedules: [
          { id: 1, name: "Weekday Schedule", startDate: "2025-01-01", endDate: "2025-12-31", screens: 5, status: "Active" },
          { id: 2, name: "Weekend Schedule", startDate: "2025-01-01", endDate: "2025-12-31", screens: 3, status: "Active" },
          { id: 3, name: "Holiday Schedule", startDate: "2025-12-24", endDate: "2025-12-26", screens: 8, status: "Scheduled" },
        ],
      });
      setIsLoading(false);
    };

    fetchOrgDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader searchQuery="" onSearchChange={() => {}} onRefresh={() => {}} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader searchQuery="" onSearchChange={() => {}} onRefresh={() => {}} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">Organization not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader searchQuery="" onSearchChange={() => {}} onRefresh={() => {}} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dshub/organizations")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
          <h1 className="text-3xl font-bold mb-2">{org.name}</h1>
          <div className="text-muted-foreground space-y-1">
            <p>{org.address}</p>
            <p>Email: {org.contactEmailId} | Phone: {org.contactNumber}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Locations Section */}
          <Card>
            <CardHeader>
              <CardTitle>Locations ({org.locations?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Timezone</TableHead>
                    <TableHead>Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.locations?.map((location) => (
                    <TableRow key={String(location.id)}>
                      <TableCell>{location.id}</TableCell>
                      <TableCell>{location.name || "—"}</TableCell>
                      <TableCell>{location.address || "—"}</TableCell>
                      <TableCell>{location.contactPerson || "—"}</TableCell>
                      <TableCell>{location.contactEmail || "—"}</TableCell>
                      <TableCell>{location.contactNumber || "—"}</TableCell>
                      <TableCell>{location.timezone || "—"}</TableCell>
                      <TableCell>{location.default ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Users Section */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({org.users?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.users?.map((user) => (
                    <TableRow key={String(user.id)}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name || "—"}</TableCell>
                      <TableCell>{user.email || "—"}</TableCell>
                      <TableCell>{user.role || "—"}</TableCell>
                      <TableCell>{user.status || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Screens Section */}
          <Card>
            <CardHeader>
              <CardTitle>Screens ({org.screens?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resolution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.screens?.map((screen) => (
                    <TableRow key={String(screen.id)}>
                      <TableCell>{screen.id}</TableCell>
                      <TableCell>{screen.name || "—"}</TableCell>
                      <TableCell>{screen.location || "—"}</TableCell>
                      <TableCell>{screen.status || "—"}</TableCell>
                      <TableCell>{screen.resolution || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Playlists Section */}
          <Card>
            <CardHeader>
              <CardTitle>Playlists ({org.playlists?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.playlists?.map((playlist) => (
                    <TableRow key={String(playlist.id)}>
                      <TableCell>{playlist.id}</TableCell>
                      <TableCell>{playlist.name || "—"}</TableCell>
                      <TableCell>{playlist.duration || "—"}</TableCell>
                      <TableCell>{playlist.items || "—"}</TableCell>
                      <TableCell>{playlist.status || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Schedules Section */}
          <Card>
            <CardHeader>
              <CardTitle>Schedules ({org.schedules?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Screens</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.schedules?.map((schedule) => (
                    <TableRow key={String(schedule.id)}>
                      <TableCell>{schedule.id}</TableCell>
                      <TableCell>{schedule.name || "—"}</TableCell>
                      <TableCell>{schedule.startDate || "—"}</TableCell>
                      <TableCell>{schedule.endDate || "—"}</TableCell>
                      <TableCell>{schedule.screens || "—"}</TableCell>
                      <TableCell>{schedule.status || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OrganizationDetails;
