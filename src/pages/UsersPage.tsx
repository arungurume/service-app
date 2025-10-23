import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchSignedUpUsers } from "@/services/dshubService";

interface User {
  id: number | string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  active?: boolean;
  joinedDate?: number | string;
  organizationId?: number;
  locationId?: number;
  roles?: { id?: number | string; name?: string }[];
}

const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string | undefined>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>("desc");
  const [users, setUsers] = useState<User[]>([]);
  const [serverTotalPages, setServerTotalPages] = useState<number | null>(null);
  const [serverTotalElements, setServerTotalElements] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pagination = useMemo(() => ({
    page: Math.max(0, currentPage - 1),
    size: Math.max(pageSize, 10),
    sortBy: sortBy ?? "id",
    sortOrder: sortOrder ?? "desc",
    q: searchQuery || undefined,
  }), [currentPage, pageSize, sortBy, sortOrder, searchQuery]);

  // Load signed-up users from UMS (fall back to MOCK_USERS on error)
  useEffect(() => {
    let mounted = true;
    fetchUsersPage(pagination);
    return () => { mounted = false; };
  }, [pagination]); // reload when pagination/search/page size change

  // New: fetch a specific users page (used by Prev/Next)
  const fetchUsersPage = async (pagination) => {
    

    setIsLoading(true);
    try {
      const res = await fetchSignedUpUsers(pagination);
      console.log("Fetched users page:", res);
      const content = (res as any).content;
      setUsers(content);
      setServerTotalElements((res as any).totalElements ?? content.length);
      setServerTotalPages((res as any).totalPages ?? Math.max(1, Math.ceil(((res as any).totalElements ?? content.length) / pageSize)));
      //setCurrentPage(clamped);
    } catch (err) {
      console.error("Failed to fetch users page:", err);
      // keep previous state; optionally fall back
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = serverTotalPages ?? Math.max(1, Math.ceil((serverTotalElements ?? users.length) / pageSize));
  const totalElements = serverTotalElements ?? users.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + users.length, totalElements);
  const paginated = users; // server returns a page

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
      await fetchUsersPage(paginationForTarget);
      // success: currentPage already updated
    } catch (err) {
      // revert on error
      console.error("Failed to fetch page:", err);
      setCurrentPage(prev);
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ["ID", "Username", "First Name", "Last Name", "Email", "Roles", "Status", "Active", "Joined", "Org ID", "Location ID"],
      ...users.map((u) => {
        const roles = (u.roles || []).map(r => r.name).join("; ");
        return [
          String(u.id),
          u.userName || "",
          u.firstName || "",
          u.lastName || "",
          u.email || "",
          roles,
          u.status || "",
          u.active ? "true" : "false",
          u.joinedDate ? String(u.joinedDate) : "",
          String(u.organizationId || ""),
          String(u.locationId || ""),
        ];
      })
    ].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","));
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={(val: string) => { setSearchQuery(val); setCurrentPage(1); }}
        onRefresh={() => { /* no-op for mock */ }}
      />

      <main className="px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Users</h1>
          <p className="text-muted-foreground">
            Showing mock users. Connect to real user APIs when ready.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="Search by username/name/email/role..."
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
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Org ID</TableHead>
                  <TableHead>Location ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((u) => (
                  <TableRow key={String(u.id)} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{u.id}</TableCell>
                    <TableCell>{u.userName || "—"}</TableCell>
                    <TableCell>{u.firstName || "—"}</TableCell>
                    <TableCell>{u.lastName || "—"}</TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{(u.roles || []).map(r => r.name).filter(Boolean).join(", ") || "—"}</TableCell>
                    <TableCell>{u.status || "—"}</TableCell>
                    <TableCell>{u.active ? "Yes" : "No"}</TableCell>
                    <TableCell>{u.joinedDate ? new Date(String(u.joinedDate)).toLocaleString() : "—"}</TableCell>
                    <TableCell>
                      {u.organizationId != null ? (
                        <Link to={`/dshub/organizations/${u.organizationId}`} className="text-blue-600 hover:underline">
                          {u.organizationId}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{u.locationId ?? "—"}</TableCell>
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

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This page uses mock users. Connect to real user APIs when ready.</p>
        </div>
      </main>
    </>
  );
};

export default UsersPage;