import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { getTemplate, listCategories, createTemplate, updateTemplate, getCanvaDesign } from "@/services/canvaTemplateService";

export default function TemplateFormPage() {
  const { id } = useParams();
  const canvaDesignId: string = id ? id : "";
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
        if (canvaDesignId) {
          const canvaRes = await getCanvaDesign(canvaDesignId);
          console.log("Fetched design from canva:", canvaRes);
          if (canvaRes) {
            const canvaDesign = canvaRes.design;
            const template = await getTemplate(null, canvaDesign.id, true);
            console.log("Fetched desing from db:", template);
            if (mounted) {
              const merged = mapCanvaAndDbToTemplate(canvaDesign, template);
              console.log("Merged template:", merged);
              setCanvaTemplate(merged);
            }
          }
        } else {
          console.log("No canva design id");
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
  }, [canvaDesignId]);

  const mapCanvaAndDbToTemplate = (
    canvaDesign: any,
    dbRes: any
  ): any => {
    const design = canvaDesign ?? {};

    return {
      id: dbRes?.id ?? 0,
      canvaDesignId: design.id ?? "",
      thumbnailUrl: design.thumbnail?.url ?? "",
      title: design.title ?? dbRes?.title ?? "",
      templateType: dbRes?.templateType ?? "DIGITAL",
      description: dbRes?.description ?? "",
      viewUrl: design.urls?.view_url ?? "",
      editUrl: design.urls?.edit_url ?? "",
      designUrl: design.urls?.edit_url ?? "",
      templateUrl: dbRes?.templateUrl ?? "",
      categories: dbRes?.categories ?? [],
      width: dbRes?.width ?? 1920,
      height: dbRes?.height ?? 1080,
      plan: dbRes?.plan ?? "FREE",
      images: dbRes?.images ?? []
    };
  }


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

      if (payload.id) {
        await updateTemplate(payload.id, payload);
        console.log("Template updated", payload.id);
      } else {
        const created = await createTemplate(payload);
        console.log("Template created", created);
      }

      navigate("/canva-templates");
    } catch (err) {
      console.error("Failed to save template", err);
      // optionally show user-facing error here
    }
  };

  const handleSaveDraft = () => saveTemplate(false);
  const handlePublish = () => saveTemplate(true);

  const addImageField = () => {
    setCanvaTemplate((prev: any) => {
      const prevImages = Array.isArray(prev?.images) ? prev.images : [];
      return { ...(prev || {}), images: [...prevImages, { id: 0, url: "" }] };
    });
  };

  const removeImageField = (index: number) => {
    setCanvaTemplate((prev: any) => {
      const prevImages = Array.isArray(prev?.images) ? prev.images : [];
      return { ...(prev || {}), images: prevImages.filter((_: any, i: number) => i !== index) };
    });
  };

  const updateImageField = (index: number, value: string) => {
    setCanvaTemplate((prev: any) => {
      const prevImages = Array.isArray(prev?.images) ? prev.images : [];
      const newImages = [...prevImages];
      newImages[index] = { ...newImages[index], url: value };
      return { ...(prev || {}), images: newImages };
    });
  };

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
              <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border">
                <div>
                  Canva Design ID: <span className="font-medium text-foreground">{canvaTemplate?.canvaDesignId || "N/A"}</span>
                </div>
                <div className="h-4 w-px bg-border"></div>
                <div>
                  DSHub ID: <span className="font-medium text-foreground">{canvaTemplate?.id ? canvaTemplate.id : "Not Synced"}</span>
                </div>
                {canvaTemplate?.id && canvaTemplate?.canvaDesignId ? (
                  <div className="ml-auto" title="Synced with Database">
                    <RefreshCw className="h-4 w-4 text-green-600" />
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Template Type</Label>
                <RadioGroup
                  value={canvaTemplate?.templateType || "DIGITAL"}
                  onValueChange={(v) =>
                    setCanvaTemplate((prev: any) => ({ ...prev, templateType: v }))
                  }
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DIGITAL" id="type-digital" />
                    <Label htmlFor="type-digital" className="font-normal cursor-pointer">
                      DIGITAL
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OTHERS" id="type-others" />
                    <Label htmlFor="type-others" className="font-normal cursor-pointer">
                      OTHERS
                    </Label>
                  </div>
                </RadioGroup>
              </div>

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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={canvaTemplate?.description ?? ""}
                  onChange={(e) =>
                    setCanvaTemplate((prev: any) => ({
                      ...(prev || {}),
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter template description"
                  rows={3}
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
                <Label>Image URLs</Label>
                <div className="space-y-2">
                  {Array.isArray(canvaTemplate?.images) && canvaTemplate.images.map((img: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={img?.url ?? ""}
                        onChange={(e) => updateImageField(idx, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button
                        onClick={() => removeImageField(idx)}
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={addImageField}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    + Add Image URL
                  </Button>
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
                      setCanvaTemplate((prev: any) => ({
                        ...(prev || {}),
                        width: 0,
                        height: 0,
                      }));
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
              <Tabs defaultValue="thumbnail">
                <TabsList className="w-full">
                  <TabsTrigger value="thumbnail" className="flex-1">
                    Thumbnail
                  </TabsTrigger>
                  <TabsTrigger value="template" className="flex-1">
                    Template
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="thumbnail" className="mt-4">
                  <div className="bg-muted rounded-lg h-[500px] flex items-center justify-center text-muted-foreground overflow-hidden">
                    {canvaTemplate?.thumbnailUrl ? (
                      <img
                        src={canvaTemplate.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      "No thumbnail available"
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
