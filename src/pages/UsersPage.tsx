import React, { useMemo, useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { createDSHubClient, DSHubClient, fetchOrganizationsFromOms } from "@/services/dshubService";

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

interface Organization {
  id: number | string;
  name?: string;
  address?: string;
  contactEmailId?: string;
  contactNumber?: string;
  locations?: Location[];
}

const MOCK_ORGS: Organization[] = [
  {
    id: 44,
    contactEmailId: "kakhileshpatel@gmail.com",
    locations: [
      {
        id: 54,
        contactPerson: "akhilesh patel",
        contactEmail: "kakhileshpatel@gmail.com",
        default: false,
      },
    ],
  },
  {
    id: 43,
    contactEmailId: "kakhileshpatel@gmail.com",
    locations: [
      {
        id: 53,
        contactPerson: "akhilesh patel",
        contactEmail: "kakhileshpatel@gmail.com",
        default: false,
      },
    ],
  },
  {
    id: 42,
    contactEmailId: "kakhileshpatel@gmail.com",
    locations: [
      {
        id: 52,
        contactPerson: "akhilesh patel",
        contactEmail: "kakhileshpatel@gmail.com",
        default: false,
      },
    ],
  },
  {
    id: 41,
    contactEmailId: "kakhileshpatel@gmail.com",
    locations: [
      {
        id: 51,
        contactPerson: "akhilesh patel",
        contactEmail: "kakhileshpatel@gmail.com",
        default: false,
      },
    ],
  },
  {
    id: 40,
    contactEmailId: "kakhileshpatel@gmail.com",
    locations: [
      {
        id: 50,
        contactPerson: "akhilesh patel",
        contactEmail: "kakhileshpatel@gmail.com",
        default: false,
      },
    ],
  },
  {
    id: 39,
    contactEmailId: "akhil.pal04@gmail.com",
    locations: [
      {
        id: 49,
        contactPerson: "akhilesh patel",
        contactEmail: "akhil.pal04@gmail.com",
        default: false,
      },
    ],
  },
  {
    id: 38,
    contactEmailId: "3@gmail.com",
    locations: [
      {
        id: 48,
        contactPerson: "Akhilesh Patel",
        contactEmail: "akhil.pal03@gmail.com",
        default: false,
      },
    ],
  },
  {
    id: 37,
    contactEmailId: "2@gmail.com",
    locations: [
      {
        id: 47,
        name: "abc",
        address: "Bilaspur, Chhattisgarh 495001, India",
        contactPerson: "akhilesh patel",
        contactEmail: "kakhileshpatel@gmail.com",
        contactNumber: "9036007615",
        timezone: "Asia/Kolkata",
        default: false,
      },
    ],
  },
  {
    id: 36,
    name: "qwe-updated",
    address: "Raipur, Chhattisgarh, India",
    contactEmailId: "org1@gmail.com",
    contactNumber: "09036007616",
    locations: [
      {
        id: 41,
        name: "Bangalore",
        address: "Puri, Odisha 752001, India",
        contactPerson: "Akhilesh Patel",
        contactEmail: "akhil.pal03@gmail.com",
        contactNumber: "78787878",
        timezone: "Asia/Kolkata",
        default: false,
      },
      {
        id: 42,
        name: "Raipur-sdf",
        address: "Bilaspur, Chhattisgarh 495001, India",
        contactPerson: "Vivek Sahu",
        contactEmail: "viveksahu@gmail.com",
        contactNumber: "9036007615",
        default: false,
      },
      {
        id: 46,
        name: "dsf",
        address: "No 293, 2nd cross, dvg road, bts layout, arekere, bannerghatta road,",
        contactPerson: "akhilesh patel",
        contactEmail: "akhil.pal03@gmail.com",
        contactNumber: "23423432",
        default: false,
      },
    ],
  },
];

// Changed code: remove baseUrl prop
type OrgPageProps = {
  client?: DSHubClient;
  token?: string;   // optional auth token
};

const OrgPage: React.FC<OrgPageProps> = ({ client, token }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [orgs, setOrgs] = useState<Organization[]>(MOCK_ORGS);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);

  // create a client only if one isn't injected
  const apiClient = useMemo(() => {
    if (client) return client;
    return createDSHubClient(token);
  }, [client, token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchOrganizationsFromOms(
          {
            page: Math.max(0, currentPage - 1),
            size: parseInt(pageSize, 10),
            sortBy,
            sortOrder,
            q: searchQuery || undefined,
          },
          token
        );
        const list = Array.isArray(res) ? res : (res && Array.isArray(res.content) ? res.content : null);
        if (mounted && list) {
          setOrgs(list as Organization[]);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error("Failed to load organizations from OMS:", err);
      }
    })();
    return () => { mounted = false; };
  }, [token, currentPage, pageSize, sortBy, sortOrder, searchQuery]);

  const filteredOrgs = orgs.filter((org) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const nameMatch = (org.name || "").toLowerCase().includes(q);
    const emailMatch = (org.contactEmailId || "").toLowerCase().includes(q);
    const locMatch = (org.locations || []).some((loc) =>
      [
        loc.name || "",
        loc.contactPerson || "",
        loc.contactEmail || "",
        loc.address || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
    return nameMatch || emailMatch || locMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrgs.length / parseInt(pageSize)));
  const startIndex = (currentPage - 1) * parseInt(pageSize);
  const endIndex = startIndex + parseInt(pageSize);
  const paginatedOrgs = filteredOrgs.slice(startIndex, endIndex);

  const handleExportCSV = () => {
    const csvRows = [
      ["Org ID", "Name", "Contact Email", "Locations Count", "Locations (name|contactPerson|contactEmail)", "Default Location"],
      ...filteredOrgs.map((org) => {
        const locs = (org.locations || []).map((l) => `${l.name || ""}|${l.contactPerson || ""}|${l.contactEmail || ""}`).join("; ");
        const defaultLoc = (org.locations || []).find(l => l.default) || (org.locations && org.locations[0]);
        const defaultLocLabel = defaultLoc ? `${defaultLoc.name || defaultLoc.contactPerson || defaultLoc.contactEmail || defaultLoc.id}` : "";
        return [
          String(org.id),
          org.name || "",
          org.contactEmailId || "",
          String((org.locations || []).length),
          locs,
          defaultLocLabel
        ];
      })
    ].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","));
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "organizations.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={(val: string) => { setSearchQuery(val); setCurrentPage(1); }}
        onRefresh={() => { /* add refresh logic when wired to API */ }}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Organizations</h1>
          <p className="text-muted-foreground">
            Click a row to manage an organization (view locations, edit contacts). Data shown is mock — wire to real APIs later.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="Search by org/name/email/location..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select value={pageSize} onValueChange={(val) => { setPageSize(val); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="25">25 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Org ID</TableHead>
                  <TableHead>Name / Email</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Locations</TableHead>
                  <TableHead>Default location / contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrgs.map((org) => {
                  const defaultLoc = (org.locations || []).find(l => l.default) || (org.locations && org.locations[0]);
                  return (
                    <TableRow key={String(org.id)} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{org.id}</TableCell>
                      <TableCell>{org.name || org.contactEmailId || "—"}</TableCell>
                      <TableCell>{org.contactEmailId || "—"}</TableCell>
                      <TableCell>{(org.locations || []).length}</TableCell>
                      <TableCell>{defaultLoc ? `${defaultLoc.name || defaultLoc.contactPerson || defaultLoc.contactEmail || defaultLoc.id}` : "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {filteredOrgs.length === 0 ? 0 : startIndex + 1} of {filteredOrgs.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This dashboard uses mock data. Wire it to real APIs later (e.g., '/api/organizations', '/api/organizations/:id/locations').</p>
        </div>
      </main>
    </div>
  );
};

export default OrgPage;