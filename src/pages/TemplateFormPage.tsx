import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTemplate, listCategories, createTemplate, updateTemplate } from "@/services/canvaTemplateService";

export default function TemplateFormPage() {
  const { id } = useParams();
  const templateId: number = id ? parseInt(id) : 0;
  const navigate = useNavigate();

  // single source of truth for the form
  const [canvaTemplate, setCanvaTemplate] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // Fetch categories first
        const catRes = await listCategories();
        console.log("Fetched categories:", catRes);
        if (mounted) {
          setCategories(catRes.content || []);
        }

        // Then fetch template details (single object). Set defaults for new template.
        if (templateId) {
          const templateRes = await getTemplate(templateId, true);
          console.log("Fetched template:", templateRes);
          if (mounted) {
            setCanvaTemplate(templateRes || null);
          }
        } else {
          // new template defaults
          if (mounted) {
            setCanvaTemplate({
              title: "",
              designUrl: "",
              templateUrl: "",
              categories: [],
              width: 1920,
              height: 1080,
              plan: "FREE",
            });
          }
        }
      } catch (e) {
        // optional: handle error / set fallback categories
        console.error("Failed to load categories", e);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [templateId]);

  const toggleCategory = (cat: any) => {
    setCanvaTemplate((prev: any) => {
      const prevCats = Array.isArray(prev?.categories) ? prev.categories : [];
      const exists = prevCats.some((c: any) => String(c.id) === String(cat.id));
      const newCats = exists
        ? prevCats.filter((c: any) => String(c.id) !== String(cat.id))
        : [...prevCats, cat];
      return { ...(prev || {}), categories: newCats };
    });
  };

  const getSizeValue = () => {
    if (!canvaTemplate) return "Custom";
    const w = canvaTemplate.width;
    const h = canvaTemplate.height;
    if (!w || !h) return "Custom";
    const s = `${w}x${h}`;
    if (s === "1920x1080") return "1920x1080";
    if (s === "1080x1920") return "1080x1920";
    return "Custom";
  };

  const saveTemplate = async (publish = false) => {
    if (!canvaTemplate) return;
    try {
      const payload = {
        ...canvaTemplate,
        status: publish ? "PUBLISHED" : (canvaTemplate.status ?? "DRAFT"),
      };

      if (templateId) {
        await updateTemplate(templateId, payload);
        console.log("Template updated", templateId);
      } else {
        const created = await createTemplate(payload);
        console.log("Template created", created);
      }

      navigate("/templates");
    } catch (err) {
      console.error("Failed to save template", err);
      // optionally show user-facing error here
    }
  };

  const handleSaveDraft = () => saveTemplate(false);
  const handlePublish = () => saveTemplate(true);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          DShub – Canva Template Admin
        </h1>
        <p className="text-muted-foreground mb-6">
          Add or manage Canva templates for your digital signage platform.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={canvaTemplate?.title ?? ""}
                  onChange={(e) =>
                    setCanvaTemplate((prev: any) => ({ ...(prev || {}), title: e.target.value }))
                  }
                  placeholder="Enter template title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designUrl">
                  Design URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="designUrl"
                  value={canvaTemplate?.designUrl ?? ""}
                  onChange={(e) =>
                    setCanvaTemplate((prev: any) => ({ ...(prev || {}), designUrl: e.target.value }))
                  }
                  placeholder="https://www.canva.com/design/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateUrl">Template URL</Label>
                <Input
                  id="templateUrl"
                  value={canvaTemplate?.templateUrl ?? ""}
                  onChange={(e) =>
                    setCanvaTemplate((prev: any) => ({ ...(prev || {}), templateUrl: e.target.value }))
                  }
                  placeholder="https://www.canva.com/design/... (template share link)"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Categories <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const checked = Array.isArray(canvaTemplate?.categories)
                      ? canvaTemplate.categories.some((c: any) => String(c.id) === String(cat.id))
                      : false;
                    return (
                      <label key={cat.id} className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCategory(cat)}
                          className="h-4 w-4 rounded border"
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select
                  value={getSizeValue()}
                  onValueChange={(v: string) => {
                    if (!canvaTemplate) return;
                    if (v === "Custom") {
                      // leave as-is (user can edit width/height)
                      return;
                    }
                    const [w, h] = v.split("x").map((n) => parseInt(n, 10) || 0);
                    setCanvaTemplate((prev: any) => ({ ...(prev || {}), width: w, height: h }));
                  }}
                >
                  <SelectTrigger id="size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Custom">Custom</SelectItem>
                    <SelectItem value="1920x1080">1920x1080</SelectItem>
                    <SelectItem value="1080x1920">1080x1920</SelectItem>
                  </SelectContent>
                </Select>

                {getSizeValue() === "Custom" && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      placeholder="Width"
                      value={String(canvaTemplate?.width ?? "")}
                      onChange={(e) =>
                        setCanvaTemplate((prev: any) => ({
                          ...(prev || {}),
                          width: parseInt(e.target.value || "0", 10) || 0,
                        }))
                      }
                    />
                    <Input
                      placeholder="Height"
                      value={String(canvaTemplate?.height ?? "")}
                      onChange={(e) =>
                        setCanvaTemplate((prev: any) => ({
                          ...(prev || {}),
                          height: parseInt(e.target.value || "0", 10) || 0,
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Plan</Label>
                <RadioGroup
                  value={(canvaTemplate?.plan ?? "FREE").toLowerCase()}
                  onValueChange={(v: string) =>
                    setCanvaTemplate((prev: any) => ({ ...(prev || {}), plan: String(v).toUpperCase() }))
                  }
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free" className="font-normal cursor-pointer">
                      Free
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label htmlFor="paid" className="font-normal cursor-pointer">
                      Paid
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveDraft} variant="outline">
                  Save Draft
                </Button>
                <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="design">
                <TabsList className="w-full">
                  <TabsTrigger value="design" className="flex-1">
                    Design
                  </TabsTrigger>
                  <TabsTrigger value="template" className="flex-1">
                    Template
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="design" className="mt-4">
                  <div className="bg-muted rounded-lg h-[500px] flex items-center justify-center text-muted-foreground">
                    {canvaTemplate?.designUrl ? (
                      <iframe
                        src={canvaTemplate.designUrl}
                        className="w-full h-full rounded-lg"
                        title="Design Preview"
                      />
                    ) : (
                      "Paste a link to preview"
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="template" className="mt-4">
                  <div className="bg-muted rounded-lg h-[500px] flex items-center justify-center text-muted-foreground">
                    {canvaTemplate?.templateUrl ? (
                      <iframe
                        src={canvaTemplate.templateUrl}
                        width="800"
                        height="450"
                        style="border: none; border-radius: 10px;"
                        allowfullscreen
                      />
                    ) : (
                      "Paste a link to preview"
                    )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
    </div >
  );
}
