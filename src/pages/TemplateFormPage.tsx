import { useState } from "react";
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

export default function TemplateFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [designUrl, setDesignUrl] = useState("");
  const [templateUrl, setTemplateUrl] = useState("");
  const [category, setCategory] = useState("Restaurant");
  const [newCategory, setNewCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [size, setSize] = useState("Custom");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [plan, setPlan] = useState("free");
  const [previewUrl, setPreviewUrl] = useState("");

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategory(newCategory.trim());
      setNewCategory("");
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleSaveDraft = () => {
    console.log("Save draft", { title, designUrl, templateUrl, category, tags, size, width, height, plan });
    navigate("/templates");
  };

  const handlePublish = () => {
    console.log("Publish", { title, designUrl, templateUrl, category, tags, size, width, height, plan });
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
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Restaurant">Restaurant</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="New category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Type tag and press Enter"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
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
                <RadioGroup value={plan} onValueChange={setPlan}>
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
