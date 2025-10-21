import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus } from "lucide-react";

// Mock data - replace with actual API call
const mockTemplates = [
  {
    id: "1",
    title: "Cocktail Menu – Neon",
    category: "Restaurant",
    plan: "free",
    size: "1920x1080",
    updated: "10/17/2025, 12:06:13 PM",
  },
  {
    id: "2",
    title: "Summer Sale Banner",
    category: "Marketing",
    plan: "paid",
    size: "1920x1080",
    updated: "10/16/2025, 10:30:00 AM",
  },
  {
    id: "3",
    title: "Coffee Shop Menu",
    category: "Restaurant",
    plan: "free",
    size: "1080x1920",
    updated: "10/15/2025, 03:15:45 PM",
  },
];

const ITEMS_PER_PAGE = 10;

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [templates] = useState(mockTemplates);

  const totalPages = Math.ceil(templates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTemplates = templates.slice(startIndex, endIndex);

  const handleAddTemplate = () => {
    navigate("/templates/new");
  };

  const handleTemplateClick = (id: string) => {
    navigate(`/templates/${id}`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              DShub – Templates
            </h1>
            <p className="text-muted-foreground">
              Manage your Canva templates.
            </p>
          </div>
          <Button onClick={handleAddTemplate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTemplates.map((template) => (
                <TableRow
                  key={template.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleTemplateClick(template.id)}
                >
                  <TableCell className="font-medium">{template.title}</TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>{template.plan}</TableCell>
                  <TableCell>{template.size}</TableCell>
                  <TableCell>{template.updated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
