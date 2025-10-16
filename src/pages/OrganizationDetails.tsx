import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { fetchScreensForOrg, fetchPlaylistsForOrg, fetchSchedulesForOrg, getOrgByOrgId, fetchUsersForOrg } from "@/services/dshubService";

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
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string; // legacy single role
  roles?: { id?: number | string; name?: string; description?: string; appType?: string }[];
  status?: string;
  active?: boolean;
  joinedDate?: string;
  // other optional fields from CMS/DS admin can be added as needed
}

interface Screen {
  id: number | string;
  name?: string;
  orientation?: "horizontal" | "vertical" | string;
  placedAt?: string;
  location?: string;
  organizationId?: number;
  locationId?: number;
  pairCode?: string;
  pairCodeExpiresAt?: number; // epoch millis
  pairStatus?: string;
  status?: string;
  screenGroupId?: number;
  defaultShowAssetType?: string;
  defaultShowAssetId?: string | number;
  defaultShowAssetName?: string;
  selectedScheduleId?: number;
  deviceUserAgent?: string;
  deviceIp?: string;
  deviceApkVersion?: string | null;
  deviceOsVersion?: string | null;
  deviceId?: string;
  deviceType?: number;
  base64Image?: string | null;
  base64ImageUpdatedAt?: number | null;
  createdBy?: number;
  updatedBy?: number;
  createdDate?: number | string; // epoch millis or ISO
  updatedDate?: number | string;
}

interface Playlist {
  id: number | string;
  name?: string;
  size?: number;
  duration?: number; // seconds (number)
  transitionType?: string;
  transitionSpeed?: string;
  thumbLink?: string;
  organizationId?: number;
  locationId?: number;
  createdBy?: number;
  updatedBy?: number;
  createdDate?: number | string; // epoch millis or ISO
  updatedDate?: number | string;
}

interface Schedule {
  id: number | string;
  name?: string;
  screenNames?: string[] | null;
  organizationId?: number;
  locationId?: number;
  createdBy?: number;
  updatedBy?: number;
  createdDate?: number | string; // epoch millis or ISO
  updatedDate?: number | string;
  // previous fields (startDate/endDate/screens/status) removed to match new API shape
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

const DeviceType = {
  ANDROID: 1,
  FIRETV: 2,
  WEB: 3,
  ROKU_OS: 4,
  OTHER: 99,
} as const;

const deviceTypeLabel = (t?: number | null) => {
  switch (t) {
    case DeviceType.ANDROID: return "Android";
    case DeviceType.FIRETV: return "Fire TV";
    case DeviceType.WEB: return "Web Player";
    case DeviceType.ROKU_OS: return "Roku OS";
    case DeviceType.OTHER: return "Unknown";
    default: return t == null ? "—" : String(t);
  }
};

const OrganizationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New: reusable helper to fetch screens from CMS for a given org id
  

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchOrgDetails = async () => {
      setIsLoading(true);

      const baseMockOrg: Organization = {
        id: id || "",
        name: `Organization ${id}`,
        address: "123 Business Street, City, State 12345",
        contactEmailId: "contact@org.com",
        contactNumber: "+1234567890",
        locations: [],
        users: [],
        // playlists removed from static mock — will be fetched from CMS below
        playlists: [],
        schedules: [],
      };

      setOrg(baseMockOrg);

      // use the extracted helper(s) to fetch screens and playlists and merge into org
      try {
        const orgId = id || "36"; // fallback to 36 if id missing

        
        try {
          const org = await getOrgByOrgId(orgId);
          setOrg(prev => prev ? { ...prev, ...org } : prev);
        } catch (err) {
          console.error("Error fetching organization from CMS:", err);
        }

        try {
          const users = await fetchUsersForOrg(orgId);
          setOrg(prev => prev ? { ...prev, users } : prev);
        } catch (err) {
          console.error("Error fetching users from CMS:", err);
        }

        try {
          const screens = await fetchScreensForOrg(orgId);
          setOrg(prev => prev ? { ...prev, screens } : prev);
        } catch (err) {
          console.error("Error fetching screens from CMS:", err);
        }

        try {
          const playlists = await fetchPlaylistsForOrg(orgId);
          setOrg(prev => prev ? { ...prev, playlists } : prev);
        } catch (err) {
          console.error("Error fetching playlists from CMS:", err);
        }
        
        try {
          const schedules = await fetchSchedulesForOrg(orgId);
          setOrg(prev => prev ? { ...prev, schedules } : prev);
        } catch (err) {
          console.error("Error fetching schedules from CMS:", err);
        }

      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgDetails();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <>
        <DashboardHeader searchQuery="" onSearchChange={() => {}} onRefresh={() => {}} />
        <main className="px-6 py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </main>
      </>
    );
  }

  if (!org) {
    return (
      <>
        <DashboardHeader searchQuery="" onSearchChange={() => {}} onRefresh={() => {}} />
        <main className="px-6 py-8">
          <div className="text-center text-muted-foreground">Organization not found</div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardHeader searchQuery="" onSearchChange={() => {}} onRefresh={() => {}} />
      
      <main className="px-6 py-8">
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
                    <TableHead>Username</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.users?.map((user) => (
                    <TableRow key={String(user.id)}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.userName || "—"}</TableCell>
                      <TableCell>{user.firstName || "—"}</TableCell>
                      <TableCell>{user.lastName || "—"}</TableCell>
                      <TableCell>{user.email || "—"}</TableCell>
                      <TableCell>
                        {Array.isArray(user.roles) && user.roles.length > 0
                          ? user.roles.map(r => r.name).filter(Boolean).join(", ")
                          : user.role || "—"}
                      </TableCell>
                      <TableCell>{user.status || "—"}</TableCell>
                      <TableCell>{user.active ? "Yes" : "No"}</TableCell>
                      <TableCell>{user.joinedDate ? new Date(user.joinedDate).toLocaleString() : "—"}</TableCell>
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
              {/* Legend shown just after the title */}
              <div className="text-sm text-muted-foreground mt-1">
                Device types: Android(1), Fire TV(2), Web Player(3), Roku OS(4), Unknown(99)
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Orientation</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Pair Status</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Device Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.screens?.map((screen) => (
                    <TableRow key={String(screen.id)}>
                      <TableCell>{screen.id}</TableCell>
                      <TableCell>{screen.name || "—"}</TableCell>
                      <TableCell>{screen.orientation || "—"}</TableCell>
                      <TableCell>{screen.location || "—"}</TableCell>
                      <TableCell>{screen.pairStatus || "—"}</TableCell>
                      <TableCell>{screen.deviceId || "—"}</TableCell>
                      <TableCell>{deviceTypeLabel(screen.deviceType)}</TableCell>
                      <TableCell>
                        {screen.createdDate
                          ? new Date(Number(screen.createdDate)).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {screen.updatedDate
                          ? new Date(Number(screen.updatedDate)).toLocaleString()
                          : "—"}
                      </TableCell>
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
                    <TableHead>Thumb</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Duration (s)</TableHead>
                    <TableHead>Transition</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Org ID</TableHead>
                    <TableHead>Location ID</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.playlists?.map((playlist) => (
                    <TableRow key={String(playlist.id)}>
                      <TableCell>{playlist.id}</TableCell>
                      <TableCell>
                        {playlist.thumbLink ? (
                          // small thumbnail
                          // eslint-disable-next-line jsx-a11y/img-redundant-alt
                          <img src={playlist.thumbLink} alt={`thumb-${playlist.id}`} className="h-10 w-16 object-cover rounded" />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{playlist.name || "—"}</TableCell>
                      <TableCell>{playlist.size ?? "—"}</TableCell>
                      <TableCell>{playlist.duration ?? "—"}</TableCell>
                      <TableCell>{playlist.transitionType || "—"}</TableCell>
                      <TableCell>{playlist.transitionSpeed || "—"}</TableCell>
                      <TableCell>{playlist.organizationId ?? "—"}</TableCell>
                      <TableCell>{playlist.locationId ?? "—"}</TableCell>
                      <TableCell>{playlist.createdBy ?? "—"}</TableCell>
                      <TableCell>{playlist.updatedBy ?? "—"}</TableCell>
                      <TableCell>
                        {playlist.createdDate ? new Date(Number(playlist.createdDate)).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>
                        {playlist.updatedDate ? new Date(Number(playlist.updatedDate)).toLocaleString() : "—"}
                      </TableCell>
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
                    <TableHead>Screens</TableHead>
                    <TableHead>Org ID</TableHead>
                    <TableHead>Location ID</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.schedules?.map((schedule) => (
                    <TableRow key={String(schedule.id)}>
                      <TableCell>{schedule.id}</TableCell>
                      <TableCell>{schedule.name || "—"}</TableCell>
                      <TableCell>
                        {Array.isArray(schedule.screenNames)
                          ? schedule.screenNames.join(", ")
                          : schedule.screenNames == null
                          ? "—"
                          : String(schedule.screenNames)}
                      </TableCell>
                      <TableCell>{schedule.organizationId ?? "—"}</TableCell>
                      <TableCell>{schedule.locationId ?? "—"}</TableCell>
                      <TableCell>{schedule.createdBy ?? "—"}</TableCell>
                      <TableCell>{schedule.updatedBy ?? "—"}</TableCell>
                      <TableCell>
                        {schedule.createdDate ? new Date(Number(schedule.createdDate)).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>
                        {schedule.updatedDate ? new Date(Number(schedule.updatedDate)).toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default OrganizationDetails;
