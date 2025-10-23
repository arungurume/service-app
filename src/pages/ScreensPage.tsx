import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAllScreens } from "@/services/dshubService";

interface Screen {
  id: number | string;
  name?: string;
  deviceId?: string;
  deviceIp?: string;
  organizationId?: number | string; 
  orgName?: string;
  location?: string;
  locationId?: number;
  orientation?: string;
  placedAt?: string;
  pairCode?: string;
  pairCodeExpiresAt?: number;
  pairStatus?: string;
  status?: string;
  screenGroupId?: number;
  defaultShowAssetType?: string;
  defaultShowAssetId?: string;
  defaultShowAssetName?: string;
  selectedScheduleId?: number;
  deviceUserAgent?: string;
  deviceApkVersion?: string | null;
  deviceOsVersion?: string | null;
  deviceType?: number;
  base64Image?: string | null;
  base64ImageUpdatedAt?: number | null;
  createdBy?: number;
  updatedBy?: number;
  createdDate?: number;
  updatedDate?: number;
}

const mapDeviceType = (dt?: number | null) => {
  switch (dt) {
    case 1:
      return "Android";
    case 2:
      return "Fire Tv";
    case 3:
      return "Web Player";
    case 4:
      return "Roku OS";
    case 99:
      return "Unknown";
    default:
      return dt != null ? String(dt) : "—";
  }
};

// add helper for online/offline indicator
const isOnline = (status?: string) => {
  const s = status?.toUpperCase();
  return s === "LIVE" || s === "ONLINE";
};

const ScreensPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);
  const [pairStatus, setPairStatus] = useState<string>("SCREEN_PAIRED");
  
  const [serverTotalPages, setServerTotalPages] = useState<number | null>(null);
  const [serverTotalElements, setServerTotalElements] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pagination = useMemo(() => ({
    page: Math.max(0, currentPage - 1),
    size: Math.max(pageSize, 10),
    sortBy: sortBy ?? "id",
    sortOrder: sortOrder ?? "desc",
    q: searchQuery || undefined,
    pairStatus,
  }), [currentPage, pageSize, sortBy, sortOrder, searchQuery, pairStatus]);

  const fetchScreensPage = async (paginationParams: { page: number; size: number; sortBy?: string; sortOrder?: "asc" | "desc"; q?: string; pairStatus?: string }) => {
    let mounted = true;
    try {
      setIsLoading(true);
      const res = await fetchAllScreens(paginationParams);
      console.log("Screens from CMS:", res);
      const totalPages = res && typeof res.totalPages === "number" ? res.totalPages : null;
      const totalElements = res && typeof res.totalElements === "number" ? res.totalElements : null;
      if (mounted) {
        setScreens(res.content || []);
        setServerTotalPages(totalPages);
        setServerTotalElements(totalElements);
      }
    } catch (err) {
      console.error("Failed to load screens from CMS:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = async (target: number) => {
    const clamped = Math.max(1, Math.min(totalPages, target));
    if (clamped === currentPage) return;
    const prev = currentPage;
    setCurrentPage(clamped);

    const paginationForTarget = {
      ...pagination,
      page: Math.max(0, clamped - 1),
      size: pageSize,
    };

    try {
      await fetchScreensPage(paginationForTarget);
    } catch (err) {
      console.error("Failed to fetch page:", err);
      setCurrentPage(prev);
    }
  };

  useEffect(() => {
    fetchScreensPage(pagination);
  }, [pagination]);

  const totalPages = serverTotalPages ?? Math.max(1, Math.ceil((serverTotalElements ?? screens.length) / pageSize));
  const totalElements = serverTotalElements ?? screens.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + screens.length, totalElements);
  const paginatedScreens = screens;

  const handleExportCSV = () => {
    const rows = [
      [
        "Screen ID",
        "Name",
        "Device ID",
        "Pair Status",
        "Orientation",
        "Placed At",
        "Location",
        "Org ID",
        "Default Asset",
        "Device Type",
      ],
      ...screens.map((screen) => [
        String(screen.id),
        screen.name || "",
        screen.deviceId || "",
        screen.pairStatus || "",
        screen.orientation || "",
        screen.placedAt || "",
        screen.location || "",
        String(screen.organizationId ??  ""),
        screen.defaultShowAssetName || "",
        mapDeviceType(screen.deviceType),
      ])
    ];

    const csvRows = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","));
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "screens.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={(val: string) => { setSearchQuery(val); setCurrentPage(1); }}
        onRefresh={() => { fetchScreensPage(pagination); }}
      />
      
      <main className="px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Screens</h1>
          <p className="text-muted-foreground">
            Manage all screens across organizations.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="Search by name, device ID, org..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select value={pairStatus} onValueChange={(val) => { setPairStatus(val); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="SCREEN_PAIRED">Screen Paired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <TableHead>Screen ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Pair Status</TableHead>
                  <TableHead>Orientation</TableHead>
                  <TableHead>Placed At</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Org ID</TableHead>
                  <TableHead>Default Asset</TableHead>
                  <TableHead>Device Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedScreens.map((screen) => (
                  <TableRow
                    key={String(screen.id)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{screen.id}</TableCell>
                    <TableCell className="flex items-center">
                      <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 ${isOnline(screen.status) ? "bg-green-500" : "bg-red-500"}`}
                        title={screen.status ?? "Unknown"}
                        aria-hidden="true"
                      />
                      <span>{screen.name || "—"}</span>
                    </TableCell>
                    <TableCell>{screen.deviceId || "—"}</TableCell>
                    <TableCell>{screen.pairStatus || "—"}</TableCell>
                    <TableCell>{screen.orientation || "—"}</TableCell>
                    <TableCell>{screen.placedAt || "—"}</TableCell>
                    <TableCell>{screen.location || screen.locationId || "—"}</TableCell>
                    <TableCell>
                      { (screen.organizationId) ? (
                        <Link
                          to={`/dshub/organizations/${screen.organizationId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {screen.organizationId}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{screen.defaultShowAssetName || "—"} ({screen.defaultShowAssetType})</TableCell>
                    <TableCell>{mapDeviceType(screen.deviceType)}</TableCell>
                  </TableRow>
                ))}
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
      </main>
    </>
  );
};

export default ScreensPage;
