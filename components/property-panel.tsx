"use client"

import { useState, useEffect, useCallback } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface PropertyPanelProps {
  selectedElement: any
  onElementUpdate?: (updatedElement: any) => void
}

export function PropertyPanel({ selectedElement, onElementUpdate }: PropertyPanelProps) {
  const [elementProperties, setElementProperties] = useState<any>(null)

  useEffect(() => {
    if (selectedElement) {
      setElementProperties({ ...selectedElement })
    } else {
      setElementProperties(null)
    }
  }, [selectedElement])

  const handlePropertyChange = useCallback(
    (property: string, value: any) => {
      setElementProperties((prev: any) => {
        const updated = {
          ...prev,
          [property]: value,
        }

        // Notify parent component of changes if callback provided
        if (onElementUpdate) {
          onElementUpdate(updated)
        }

        return updated
      })
    },
    [onElementUpdate],
  )

  if (!elementProperties) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        <p>Select an element to edit its properties</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Properties</h3>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="element-name">Name</Label>
            <Input
              id="element-name"
              value={elementProperties.name || ""}
              onChange={(e) => handlePropertyChange("name", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="element-type">Type</Label>
            <Select value={elementProperties.type} onValueChange={(value) => handlePropertyChange("type", value)}>
              <SelectTrigger id="element-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="store">Store</SelectItem>
                <SelectItem value="elevator">Elevator</SelectItem>
                <SelectItem value="escalator">Escalator</SelectItem>
                <SelectItem value="room">Room</SelectItem>
                <SelectItem value="pathway">Pathway</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 mt-4">
            <Label htmlFor="element-floor">Floor</Label>
            <div className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              <span className="text-sm">{elementProperties.floor || 1}</span>
            </div>
            <p className="text-xs text-muted-foreground">Elements are assigned to the floor they were created on</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="element-x">X Position</Label>
              <Input
                id="element-x"
                type="number"
                value={elementProperties.x || 0}
                onChange={(e) => handlePropertyChange("x", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="element-y">Y Position</Label>
              <Input
                id="element-y"
                type="number"
                value={elementProperties.y || 0}
                onChange={(e) => handlePropertyChange("y", Number.parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="element-width">Width</Label>
              <Input
                id="element-width"
                type="number"
                value={elementProperties.width || 100}
                onChange={(e) => handlePropertyChange("width", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="element-height">Height</Label>
              <Input
                id="element-height"
                type="number"
                value={elementProperties.height || 100}
                onChange={(e) => handlePropertyChange("height", Number.parseInt(e.target.value))}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="element-color">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="element-color"
                type="color"
                value={elementProperties.color || "#e2e8f0"}
                onChange={(e) => handlePropertyChange("color", e.target.value)}
                className="w-12"
              />
              <Input
                value={elementProperties.color || "#e2e8f0"}
                onChange={(e) => handlePropertyChange("color", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="element-opacity">Opacity</Label>
            <div className="flex items-center gap-4">
              <Slider id="element-opacity" defaultValue={[100]} max={100} step={1} className="flex-1" />
              <span className="w-12 text-right">100%</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="element-border">Border Style</Label>
            <Select defaultValue="solid">
              <SelectTrigger id="element-border">
                <SelectValue placeholder="Select border style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="element-radius">Corner Radius</Label>
            <div className="flex items-center gap-4">
              <Slider id="element-radius" defaultValue={[4]} max={20} step={1} className="flex-1" />
              <span className="w-12 text-right">4px</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="element-floor">Floor</Label>
            <Select
              value={elementProperties.floor?.toString() || "1"}
              onValueChange={(value) => handlePropertyChange("floor", Number.parseInt(value))}
            >
              <SelectTrigger id="element-floor">
                <SelectValue placeholder="Select floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="element-category">Category</Label>
            <Select defaultValue="retail">
              <SelectTrigger id="element-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="food">Food & Beverage</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="facility">Facility</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="element-id">Element ID</Label>
            <Input id="element-id" value={elementProperties.id || ""} disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="element-notes">Notes</Label>
            <textarea
              id="element-notes"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Add notes about this element"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button>Apply Changes</Button>
      </div>
    </div>
  )
}
