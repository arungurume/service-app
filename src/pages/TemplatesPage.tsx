import { useState, useEffect } from "react";
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
import { Plus, FolderOpen } from "lucide-react";
import { listTemplates } from "@/services/canvaTemplateService";

const ITEMS_PER_PAGE = 10;

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [templates, setTemplates] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      // page is zero-based for the API
      const res = await listTemplates({ page, size: ITEMS_PER_PAGE });
      const items = Array.isArray(res?.content) ? res.content : [];
      setTemplates(items);
      // prefer server-provided totalPages, fallback to computed value
      if (typeof res?.totalPages === "number") {
        setTotalPages(res.totalPages);
      } else if (typeof res?.totalElements === "number") {
        setTotalPages(Math.max(1, Math.ceil(res.totalElements / ITEMS_PER_PAGE)));
      } else {
        setTotalPages(Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE)));
      }
    } catch (e: any) {
      console.error("Failed to load templates", e);
      setError(e?.message || "Failed to load templates");
      setTemplates([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // API page is zero-based
    fetchTemplates(currentPage - 1);
  }, [currentPage]);

  const startIndex = 0; // server returns only current page so we just display templates
  const currentTemplates = templates;

  const handleAddTemplate = () => {
    navigate("/templates/0");
  };

  const handleManageCategory = () => {
    navigate("/category");
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
          <div className="flex gap-2">
            <Button onClick={handleManageCategory} variant="outline" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Manage Category
            </Button>
            <Button onClick={handleAddTemplate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          {loading && templates.length === 0 ? (
            <div className="p-6 text-muted-foreground">Loading templates...</div>
          ) : error ? (
            <div className="p-6 text-destructive">Error: {error}</div>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTemplates.map((template: any) => {
                const size = template.width && template.height ? `${template.width}x${template.height}` : template.size || "-";
                const plan = template.plan ? String(template.plan).toLowerCase() : "-";
                const status = template.status ? String(template.status).toLowerCase() : "-"; 
                const tags = template.tags ? String(template.tags) : "-";
                const updated = template.updatedAt || template.updated || template.createdAt || template.createdDate;
                const updatedDisplay = updated ? new Date(updated).toLocaleString() : "-";
                return (
                  <TableRow
                    key={template.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleTemplateClick(String(template.id))}
                  >
                    <TableCell className="font-medium">{template.title || "-"}</TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell>{plan}</TableCell>
                    <TableCell>{size}</TableCell>
                    <TableCell>{updatedDisplay}</TableCell>
                  </TableRow>
                );
              })}
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
