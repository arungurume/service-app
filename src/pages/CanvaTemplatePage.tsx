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
import { Plus, LayoutGrid, List } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { listCanvaDesigns } from "@/services/canvaTemplateService";

export default function CanvaTemplatePage() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [continuation, setContinuation] = useState<string | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await listCanvaDesigns();  // first page → no continuation

            setTemplates(data?.items ?? []);
            setContinuation(data?.continuation ?? null); // Save next page token
        } catch (error) {
            console.error("Failed to load templates", error);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };



    // Fetch next page
    const fetchMoreTemplates = async () => {
        if (!continuation) return; // No more pages

        setLoading(true);
        try {
            const data = await listCanvaDesigns({ continuation }); // pass continuation token

            setTemplates(prev => [...prev, ...(data?.items ?? [])]);
            setContinuation(data?.continuation ?? null);
        } catch (error) {
            console.error("Failed to load more templates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTemplate = () => {
        // Navigate to a create page (assuming reused form or new one)
        navigate("/templates/0");
    };

    const handleTemplateClick = (id: string) => {
        // Navigate to detail page
        navigate(`/templates/${id}`);
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Canva Templates
                        </h1>
                        <p className="text-muted-foreground">
                            Browse and manage your design templates.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-muted rounded-lg p-1 mr-2">
                            <Button
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode("grid")}
                                title="Grid View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "table" ? "default" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode("table")}
                                title="Table View"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button onClick={handleAddTemplate} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Template
                        </Button>
                    </div>
                </div>

                {loading && templates.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">Loading templates...</div>
                ) : (
                    <>
                        {/* GRID VIEW */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                {templates.map((template) => (
                                    <Card
                                        key={template.id}
                                        className="overflow-hidden hover:shadow-lg transition-shadow group"
                                    >
                                        <div
                                            className="relative aspect-video bg-muted overflow-hidden flex items-center justify-center cursor-pointer"
                                            onClick={() => handleTemplateClick(template.id)}
                                        >
                                            {template.thumbnail?.url ? (
                                                <img
                                                    src={template.thumbnail.url}
                                                    alt={template.title}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <LayoutGrid className="h-12 w-12 text-muted-foreground/50" />
                                            )}
                                        </div>
                                        <CardHeader className="p-4 pb-2">
                                            <CardTitle
                                                className="text-lg truncate cursor-pointer hover:underline"
                                                title={template.title}
                                                onClick={() => handleTemplateClick(template.id)}
                                            >
                                                {template.title}
                                            </CardTitle>
                                            <div className="text-xs text-muted-foreground">
                                                Canva Design ID: {template.id}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                                            <div className="flex justify-between mt-2">
                                                <span>{template.thumbnail?.width || 0} x {template.thumbnail?.height || 0} px</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
                                            <span>Updated {new Date(template.updated_at * 1000).toLocaleDateString()}</span>
                                            {(template.urls?.edit_url || template.edit_url || template.editUrl) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(template.urls?.edit_url || template.edit_url || template.editUrl, "_blank");
                                                    }}
                                                >
                                                    Edit in Canva
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* TABLE VIEW */}
                        {viewMode === "table" && (
                            <div className="bg-card rounded-lg border shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Updated</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templates.map((template) => {
                                            const size = template.thumbnail?.width && template.thumbnail?.height ? `${template.thumbnail.width}x${template.thumbnail.height}` : "-";
                                            // Handling timestamp which might be in seconds based on new data (created_at: 1765355788)
                                            // Multiplying by 1000 for JS Date constructor if it's seconds
                                            const updatedDisplay = template.updated_at ? new Date(template.updated_at * 1000).toLocaleString() : "-";

                                            return (
                                                <TableRow
                                                    key={template.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => handleTemplateClick(String(template.id))}
                                                >
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            {/* Small thumbnail in table view */}
                                                            <div className="h-8 w-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                                                {template.thumbnail?.url && (
                                                                    <img src={template.thumbnail.url} alt="" className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div>{template.title || "-"}</div>
                                                                <div className="text-xs text-muted-foreground">Canva Design ID: {template.id}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{size}</TableCell>
                                                    <TableCell>{updatedDisplay}</TableCell>
                                                    <TableCell>
                                                        {(template.urls?.edit_url || template.edit_url || template.editUrl) && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(template.urls?.edit_url || template.edit_url || template.editUrl, "_blank");
                                                                }}
                                                            >
                                                                Edit in Canva
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {templates.length === 0 && !loading && (
                            <div className="text-center py-12 text-muted-foreground">
                                No templates found.
                            </div>
                        )}

                        {/* LOAD MORE */}
                        {continuation && (
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={fetchMoreTemplates}
                                    disabled={loading}
                                    variant="secondary"
                                    size="lg"
                                >
                                    {loading ? "Loading more..." : "Load More"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
