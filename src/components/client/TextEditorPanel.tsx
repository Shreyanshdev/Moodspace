"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditorStore, TextOverlay, TEXT_STYLE_PRESETS } from "@/store/editorStore";
import { Type, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export function TextEditorPanel() {
  const {
    textOverlays,
    selectedTextId,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    selectTextOverlay,
    clearAllText,
  } = useEditorStore();

  const selectedText = textOverlays.find((t) => t.id === selectedTextId);
  const [newText, setNewText] = useState("");

  const handleAddText = () => {
    if (!newText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    addTextOverlay({
      text: newText,
      x: 100,
      y: 100,
      fontSize: 48,
      fontFamily: "Arial",
      color: "#FFFFFF",
      opacity: 1,
      rotation: 0,
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "center",
      textDecoration: "none",
    });

    setNewText("");
    toast.success("Text added! Click on canvas to position it.");
  };

  const handleApplyStyle = (styleName: keyof typeof TEXT_STYLE_PRESETS) => {
    if (!selectedTextId) {
      toast.error("Please select a text layer first");
      return;
    }
    const preset = TEXT_STYLE_PRESETS[styleName];
    updateTextOverlay(selectedTextId, {
      ...preset,
      x: selectedText?.x || 100,
      y: selectedText?.y || 100,
      text: selectedText?.text || "Your Text",
    });
    toast.success(`${styleName} style applied!`);
  };

  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Palatino",
    "Garamond",
    "Comic Sans MS",
    "Impact",
    "Trebuchet MS",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" />
          Text Overlay
        </CardTitle>
        <CardDescription>
          Add and customize text on your wallpaper
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ✅ Style Presets */}
        <div className="space-y-2">
          <Label>Quick Styles</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(TEXT_STYLE_PRESETS).map((styleName) => (
              <Button
                key={styleName}
                variant="outline"
                size="sm"
                onClick={() => handleApplyStyle(styleName as keyof typeof TEXT_STYLE_PRESETS)}
                className="capitalize"
              >
                {styleName}
              </Button>
            ))}
          </div>
        </div>

        {/* Add new text */}
        <div className="space-y-2">
          <Label>Add New Text</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter text..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddText()}
            />
            <Button onClick={handleAddText} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Text list */}
        {textOverlays.length > 0 && (
          <div className="space-y-2">
            <Label>Text Layers ({textOverlays.length})</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {textOverlays.map((overlay) => (
                <div
                  key={overlay.id}
                  className={`p-2 border rounded cursor-pointer ${
                    selectedTextId === overlay.id
                      ? "border-primary bg-primary/10"
                      : "border-border"
                  }`}
                  onClick={() => selectTextOverlay(overlay.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">{overlay.text}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTextOverlay(overlay.id);
                        toast.success("Text removed");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit selected text */}
        {selectedText && (
          <div className="space-y-4 pt-4 border-t">
            <Label>Edit Selected Text</Label>

            <div className="space-y-2">
              <Label>Text Content</Label>
              <Input
                value={selectedText.text}
                onChange={(e) =>
                  updateTextOverlay(selectedText.id, { text: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={selectedText.fontFamily}
                onValueChange={(value) =>
                  updateTextOverlay(selectedText.id, { fontFamily: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">
                  {selectedText.fontSize}px
                </span>
              </div>
              <Slider
                value={[selectedText.fontSize]}
                onValueChange={([value]) =>
                  updateTextOverlay(selectedText.id, { fontSize: value })
                }
                min={12}
                max={200}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={selectedText.color}
                  onChange={(e) =>
                    updateTextOverlay(selectedText.id, { color: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={selectedText.color}
                  onChange={(e) =>
                    updateTextOverlay(selectedText.id, { color: e.target.value })
                  }
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background Color (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={selectedText.backgroundColor || "#000000"}
                  onChange={(e) =>
                    updateTextOverlay(selectedText.id, {
                      backgroundColor: e.target.value,
                    })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={selectedText.backgroundColor || ""}
                  onChange={(e) =>
                    updateTextOverlay(selectedText.id, {
                      backgroundColor: e.target.value || undefined,
                    })
                  }
                  placeholder="Leave empty for transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opacity</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(selectedText.opacity * 100)}%
                </span>
              </div>
              <Slider
                value={[selectedText.opacity * 100]}
                onValueChange={([value]) =>
                  updateTextOverlay(selectedText.id, { opacity: value / 100 })
                }
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Rotation</Label>
                <span className="text-sm text-muted-foreground">
                  {selectedText.rotation}°
                </span>
              </div>
              <Slider
                value={[selectedText.rotation]}
                onValueChange={([value]) =>
                  updateTextOverlay(selectedText.id, { rotation: value })
                }
                min={-180}
                max={180}
                step={1}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Font Weight</Label>
                <Select
                  value={selectedText.fontWeight}
                  onValueChange={(value: "normal" | "bold" | "lighter") =>
                    updateTextOverlay(selectedText.id, { fontWeight: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="lighter">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Style</Label>
                <Select
                  value={selectedText.fontStyle}
                  onValueChange={(value: "normal" | "italic") =>
                    updateTextOverlay(selectedText.id, { fontStyle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="italic">Italic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Text Align</Label>
              <Select
                value={selectedText.textAlign}
                onValueChange={(value: "left" | "center" | "right") =>
                  updateTextOverlay(selectedText.id, { textAlign: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Text Decoration</Label>
              <Select
                value={selectedText.textDecoration}
                onValueChange={(value: "none" | "underline" | "line-through") =>
                  updateTextOverlay(selectedText.id, { textDecoration: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="underline">Underline</SelectItem>
                  <SelectItem value="line-through">Strikethrough</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Stroke (Outline)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="color"
                  value={selectedText.strokeColor || "#000000"}
                  onChange={(e) =>
                    updateTextOverlay(selectedText.id, {
                      strokeColor: e.target.value || undefined,
                    })
                  }
                  className="h-10"
                />
                <Input
                  type="number"
                  placeholder="Width"
                  value={selectedText.strokeWidth || ""}
                  onChange={(e) =>
                    updateTextOverlay(selectedText.id, {
                      strokeWidth: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={() => {
                clearAllText();
                toast.success("All text removed");
              }}
              className="w-full"
            >
              Clear All Text
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}