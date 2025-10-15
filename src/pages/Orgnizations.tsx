import React, { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchOrganizationsFromOms } from "@/services/dshubService";

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

const Orgnizations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);

  // server pagination / loading state
  const [serverTotalPages, setServerTotalPages] = useState<number | null>(null);
  const [serverTotalElements, setServerTotalElements] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New: memoized pagination params used for fetching
  const pagination = useMemo(() => ({
    page: Math.max(0, currentPage - 1),
    size: Math.max(pageSize, 10),
    sortBy: sortBy ?? "id",
    sortOrder: sortOrder ?? "desc",
    q: searchQuery || undefined,
  }), [currentPage, pageSize, sortBy, sortOrder, searchQuery]);

  // New: extracted fetch function (call from useEffect or other handlers)
  const fetchOrgsPage = async (paginationParams: { page: number; size: number; sortBy?: string; sortOrder?: "asc" | "desc"; q?: string }) => {
    let mounted = true; // local mounted flag for this call
    try {
      setIsLoading(true);
      const res = await fetchOrganizationsFromOms(paginationParams);
      console.log("Organizations from OMS:", res);
      const totalPages = res && typeof res.totalPages === "number" ? res.totalPages : null;
      const totalElements = res && typeof res.totalElements === "number" ? res.totalElements : null;
      if (mounted) {
        setOrgs(res.content);
        setServerTotalPages(totalPages);
        setServerTotalElements(totalElements);
      }
    } catch (err) {
      console.error("Failed to load organizations from OMS:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // New: unified page setter that updates currentPage and fetches that page immediately.
  const goToPage = async (target: number) => {
    const clamped = Math.max(1, Math.min(totalPages, target));
    if (clamped === currentPage) return;
    const prev = currentPage;
    setCurrentPage(clamped);

    // build pagination params for the target page (page is 0-based)
    const paginationForTarget = {
      ...pagination,
      page: Math.max(0, clamped - 1),
      size: pageSize,
    };

    try {
      await fetchOrgsPage(paginationForTarget);
      // success: currentPage already updated
    } catch (err) {
      // revert on error
      console.error("Failed to fetch page:", err);
      setCurrentPage(prev);
    }
  };

  useEffect(() => {
    // call the extracted function
    fetchOrgsPage(pagination);
    // cleanup not required for this function (it doesn't hold subscriptions)
  }, [pagination]); // effect runs when pagination changes

  // prefer server-provided totals when present
  const totalPages = serverTotalPages ?? Math.max(1, Math.ceil((serverTotalElements ?? orgs.length) / pageSize));
  const totalElements = serverTotalElements ?? orgs.length;
  const startIndex = (currentPage - 1) * pageSize;
  // endIndex is start + number of items on this page (orgs.length) but shouldn't exceed totalElements
  const endIndex = Math.min(startIndex + orgs.length, totalElements);
  const paginatedOrgs = orgs; // server already provided the page

  const handleExportCSV = () => {
    const csvRows = [
      ["Org ID", "Name", "Contact Email", "Locations Count", "Locations (name|contactPerson|contactEmail)", "Default Location"],
      ...orgs.map((org) => {
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
                  <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(parseInt(val, 10)); setCurrentPage(1); }}>
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
                <Button variant="outline" onClick={handleExportCSV} disabled={isLoading}>
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
                  <TableHead>Org Name</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Locations</TableHead>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrgs.map((org) => {
                  const defaultLoc = (org.locations || []).find(l => l.default) || (org.locations && org.locations[0]);
                  return (
                    <TableRow 
                      key={String(org.id)} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => window.location.href = `/dshub/organizations/${org.id}`}
                    >
                      <TableCell className="font-medium">{org.id}</TableCell>
                      <TableCell>{org.name || "—"}</TableCell>
                      <TableCell>{org.contactEmailId || "—"}</TableCell>
                      <TableCell>{org.contactNumber || "—"}</TableCell>
                      <TableCell>{(org.locations || []).length}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {totalElements === 0 ? 0 : startIndex + 1} - {endIndex} of {totalElements}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={isLoading || currentPage === 1}
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
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={isLoading || currentPage === totalPages}
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

export default Orgnizations;