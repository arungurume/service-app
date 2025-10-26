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
import { getTemplate, listCategories } from "@/services/canvaTemplateService";

export default function TemplateFormPage() {
  const { id } = useParams();
  const templateId: number = id ? parseInt(id) : 0;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [designUrl, setDesignUrl] = useState("");
  const [templateUrl, setTemplateUrl] = useState("");
  // fetched canva templates and selected categories state (multiple selection)
  const [canvaTemplate, setCanvaTemplate] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // Fetch categories first
        const catRes = await listCategories();
        console.log("Fetched categories:", catRes);
        if (mounted) {
          setCategories(catRes.content);
        }

        //Then fetch template details
        if (templateId) {
          const templateRes = await getTemplate(templateId);
          console.log("Fetched templates:", templateRes);
          if (mounted) {
            setCanvaTemplate(templateRes.content);
          }
        } else {
          //its a new template, reset form
          setCanvaTemplate(null);
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
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };
  const [size, setSize] = useState("Custom");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [plan, setPlan] = useState("free");
  const [previewUrl, setPreviewUrl] = useState("");

  const handleSaveDraft = () => {
    console.log("Save draft", { title, designUrl, templateUrl, categories: selectedCategories, size, width, height, plan });
    navigate("/templates");
  };

  const handlePublish = () => {
    console.log("Publish", { title, designUrl, templateUrl, categories: selectedCategories, size, width, height, plan });
    navigate("/templates");
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
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter template title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designUrl">
                  Design URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="designUrl"
                  value={designUrl}
                  onChange={(e) => setDesignUrl(e.target.value)}
                  placeholder="https://www.canva.com/design/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateUrl">Template URL</Label>
                <Input
                  id="templateUrl"
                  value={templateUrl}
                  onChange={(e) => setTemplateUrl(e.target.value)}
                  placeholder="https://www.canva.com/design/... (template share link)"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Categories <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="h-4 w-4 rounded border"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger id="size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Custom">Custom</SelectItem>
                    <SelectItem value="1920x1080">1920x1080</SelectItem>
                    <SelectItem value="1080x1920">1080x1920</SelectItem>
                  </SelectContent>
                </Select>
                {size === "Custom" && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      placeholder="Width"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                    />
                    <Input
                      placeholder="Height"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Plan</Label>
                <RadioGroup value={plan} onValueChange={setPlan} className="flex items-center space-x-6">
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
                    {designUrl ? (
                      <iframe
                        src={designUrl}
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
                    {templateUrl ? (
                      <iframe
                        src={templateUrl}
                        className="w-full h-full rounded-lg"
                        title="Template Preview"
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
    </div>
  );
}
