import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  username: string;
  signUpTime: string;
  lastLogin: string;
  orgName: string;
  plan: "Free" | "Pro" | "Business";
  status?: "Blocked";
}

const MOCK_USERS: User[] = [
  {
    id: "1",
    username: "ceo@startup.dev",
    signUpTime: "9/9/2025, 10:49:00 AM",
    lastLogin: "9/11/2025, 6:34:00 PM",
    orgName: "Startup Dev",
    plan: "Free"
  },
  {
    id: "2",
    username: "manager@cafe-bcn.com",
    signUpTime: "9/2/2025, 10:17:00 AM",
    lastLogin: "9/9/2025, 11:13:00 AM",
    orgName: "Cafe BCN",
    plan: "Free",
    status: "Blocked"
  },
  {
    id: "3",
    username: "owner@pizzaria.io",
    signUpTime: "8/30/2025, 10:47:00 AM",
    lastLogin: "—",
    orgName: "Pizzaria IO",
    plan: "Free"
  },
  {
    id: "4",
    username: "admin@schoola.edu",
    signUpTime: "7/29/2025, 10:04:00 AM",
    lastLogin: "9/11/2025, 4:05:00 PM",
    orgName: "School A",
    plan: "Pro"
  },
  {
    id: "5",
    username: "ops@digitalsigns.ai",
    signUpTime: "7/14/2025, 10:18:00 AM",
    lastLogin: "9/8/2025, 2:14:00 PM",
    orgName: "DS – Digitalsigns.ai",
    plan: "Pro"
  },
  {
    id: "6",
    username: "marketing@fitnesshub.app",
    signUpTime: "6/6/2025, 10:21:00 AM",
    lastLogin: "9/5/2025, 10:36:00 AM",
    orgName: "FitnessHub",
    plan: "Business"
  },
  {
    id: "7",
    username: "katrina@digitalsigns.ai",
    signUpTime: "5/15/2025, 10:02:00 AM",
    lastLogin: "9/11/2025, 9:19:00 AM",
    orgName: "DS – Digitalsigns.ai",
    plan: "Free"
  },
  {
    id: "8",
    username: "it@hotelmarina.es",
    signUpTime: "2/14/2025, 10:37:00 AM",
    lastLogin: "8/29/2025, 1:28:00 PM",
    orgName: "Hotel Marina",
    plan: "Pro"
  },
  {
    id: "9",
    username: "arun@bytzo.com",
    signUpTime: "11/16/2024, 10:52:00 AM",
    lastLogin: "9/10/2025, 12:31:00 PM",
    orgName: "BYTZO INC.",
    plan: "Business"
  },
  {
    id: "10",
    username: "franzi@educationalnetworks.net",
    signUpTime: "8/8/2024, 10:52:00 AM",
    lastLogin: "8/21/2025, 8:15:00 AM",
    orgName: "Educational Networks",
    plan: "Business"
  }
];

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = MOCK_USERS.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / parseInt(pageSize));
  const startIndex = (currentPage - 1) * parseInt(pageSize);
  const endIndex = startIndex + parseInt(pageSize);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "Pro":
        return "secondary";
      case "Business":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Username", "Sign up time", "Last login", "Org name", "Plan", "Status"],
      ...filteredUsers.map(user => [
        user.username,
        user.signUpTime,
        user.lastLogin,
        user.orgName,
        user.plan,
        user.status || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        searchQuery=""
        onSearchChange={() => {}}
        onRefresh={() => {}}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Users</h1>
          <p className="text-muted-foreground">
            Click a row to manage a user (reset password, block, change plan).
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="Search by user/org/plan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select value={pageSize} onValueChange={setPageSize}>
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
                  <TableHead>Username</TableHead>
                  <TableHead>Sign up time ↓</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead>Org name</TableHead>
                  <TableHead>Plan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.username}
                        {user.status === "Blocked" && (
                          <Badge variant="destructive" className="text-xs">
                            Blocked
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.signUpTime}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>{user.orgName}</TableCell>
                    <TableCell>
                      <Badge variant={getPlanBadgeVariant(user.plan)}>
                        {user.plan}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} of {filteredUsers.length}
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
          <p>This dashboard uses mock data. Wire it to real APIs later (e.g., '/api/users', '/api/users/:id/reset-password', '/api/users/:id/block', '/api/users/:id/plan', '/api/health/:id', '/api/logs/:id', '/api/restart/:id').</p>
        </div>
      </main>
    </div>
  );
};

export default UsersPage;