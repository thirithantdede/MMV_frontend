"use client"

import type React from "react"

import { useState, useEffect, useCallback, memo, useMemo } from "react"
import { Trash2, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useMapEditor } from "@/context/map-editor-context"
import type { EventElement, MainElement, MapElement } from "@/types"

// Import the new StorePropertiesPanel component
import { StorePropertiesPanel } from "@/components/panels/store-properties-panel"


const GeneralProperties = memo(function GeneralProperties({
  element,
  onPropertyChange,
}: {
  element: MapElement
  onPropertyChange: (property: string, value: any) => void
}) {
  // Local state for inputs
  const [formData, setFormData] = useState({
    name: element.name || "",
    type: element.type || "",
    x: element.x || 0,
    y: element.y || 0,
    width: element.width || 100,
    height: element.height || 100,
  })

  const elementTypes = useMemo(
    () => [
      { value: "store", label: "Store" },
      { value: "elevator", label: "Elevator" },
      { value: "escalator", label: "Escalator" },
      { value: "room", label: "Room" },
      { value: "pathway", label: "Pathway" },
      { value: "door", label: "Door" },
      { value: "banner", label: "Banner" },
      { value: "event", label: "Event" },
      { value: "info", label: "Information" },
      { value: "atm", label: "ATM" },
      { value: "security", label: "Security" },
      { value: "promotion", label: "Promotion" },
    ],
    [],
  )

  // Handle input changes
  const handleChange = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleApply = () => {
    Object.entries(formData).forEach(([key, value]) => {
      onPropertyChange(key, value)
    })
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="element-name">Name</Label>
        <Input
          id="element-name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange("type", value)}
        >
          <SelectTrigger id="element-type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {elementTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="element-x">X Position</Label>
          <Input
            id="element-x"
            type="number"
            value={formData.x}
            onChange={(e) => handleChange("x", parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="element-y">Y Position</Label>
          <Input
            id="element-y"
            type="number"
            value={formData.y}
            onChange={(e) => handleChange("y", parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="element-width">Width</Label>
          <Input
            id="element-width"
            type="number"
            value={formData.width}
            onChange={(e) => handleChange("width", parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="element-height">Height</Label>
          <Input
            id="element-height"
            type="number"
            value={formData.height}
            onChange={(e) => handleChange("height", parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="pt-4">
            <Button
              variant="default"
              onClick={handleApply}
              className="w-full float-right"
              >
              Apply 
              </Button>
      </div>
    </div>
  )
})


const StyleProperties = memo(function StyleProperties({
  element,
  onPropertyChange,
}: {
  element: MapElement
  onPropertyChange: (property: string, value: any) => void
}) {
  // Memoize border styles to prevent recreation on each render
  const borderStyles = useMemo(
    () => [
      { value: "none", label: "None" },
      { value: "solid", label: "Solid" },
      { value: "dashed", label: "Dashed" },
      { value: "dotted", label: "Dotted" },
    ],
    [],
  )

  // Optimize handlers with useCallback
  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("color", e.target.value),
    [onPropertyChange],
  )

  const handleOpacityChange = useCallback(
    (value: number[]) => onPropertyChange("opacity", value[0]),
    [onPropertyChange],
  )

  const handleBorderStyleChange = useCallback(
    (value: string) => onPropertyChange("borderStyle", value),
    [onPropertyChange],
  )

  const handleBorderRadiusChange = useCallback(
    (value: number[]) => onPropertyChange("borderRadius", value[0]),
    [onPropertyChange],
  )

  const handleRotationChange = useCallback(
    (value: number[]) => onPropertyChange("rotation", value[0]),
    [onPropertyChange],
  )

  const rotateElement = useCallback(() => {
    const currentRotation = element.rotation || 0
    const newRotation = (currentRotation + 90) % 360
    onPropertyChange("rotation", newRotation)
  }, [element.rotation, onPropertyChange])

  const resetRotation = useCallback(() => {
    onPropertyChange("rotation", 0)
  }, [onPropertyChange])

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="element-color">Background Color</Label>
        <div className="flex gap-2">
          <Input
            id="element-color"
            type="color"
            value={element.color || "#e2e8f0"}
            onChange={handleColorChange}
            className="w-12"
          />
          <Input value={element.color || "#e2e8f0"} onChange={handleColorChange} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-opacity">Opacity</Label>
        <div className="flex items-center gap-4">
          <Slider
            id="element-opacity"
            value={[element.opacity || 100]}
            max={100}
            step={1}
            className="flex-1"
            onValueChange={handleOpacityChange}
          />
          <span className="w-12 text-right">{element.opacity || 100}%</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-border">Border Style</Label>
        <Select value={element.borderStyle || "solid"} onValueChange={handleBorderStyleChange}>
          <SelectTrigger id="element-border">
            <SelectValue placeholder="Select border style" />
          </SelectTrigger>
          <SelectContent>
            {borderStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-radius">Corner Radius</Label>
        <div className="flex items-center gap-4">
          <Slider
            id="element-radius"
            value={[element.borderRadius || 4]}
            max={20}
            step={1}
            className="flex-1"
            onValueChange={handleBorderRadiusChange}
          />
          <span className="w-12 text-right">{element.borderRadius || 4}px</span>
        </div>
      </div>

      <Separator className="my-2" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Rotation</Label>
          <Button variant="outline" size="sm" onClick={resetRotation}>
            <RotateCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Slider
                id="element-rotation"
                value={[element.rotation || 0]}
                max={360}
                step={90}
                onValueChange={handleRotationChange}
              />
            </div>
            <span className="w-12 text-right">{element.rotation || 0}°</span>
            <Button variant="secondary" size="icon" onClick={rotateElement} className="ml-1">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center mt-2">
            <div
              className="bg-muted/30 rounded-md p-4 flex items-center justify-center"
              style={{ width: "120px", height: "80px" }}
            >
              <div
                className="bg-background border-2 border-gray-300 flex items-center justify-center"
                style={{
                  width: "80px",
                  height: "50px",
                  transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
                }}
              >
                <span className="text-xs">Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Store-specific properties component
const StoreProperties = memo(function StoreProperties({
  element,
  onPropertyChange,
}: {
  element: MainElement
  onPropertyChange: (property: string, value: any) => void
}) {
  // Memoize closed days to prevent recreation on each render
  const closedDays = useMemo(
    () => [
      { value: "none", label: "None" },
      { value: "monday", label: "Monday" },
      { value: "tuesday", label: "Tuesday" },
      { value: "wednesday", label: "Wednesday" },
      { value: "thursday", label: "Thursday" },
      { value: "friday", label: "Friday" },
      { value: "saturday", label: "Saturday" },
      { value: "sunday", label: "Sunday" },
    ],
    [],
  )

  // Memoize store categories to prevent recreation on each render
  const storeCategories = useMemo(
    () => [
      { value: "retail", label: "Retail" },
      { value: "food", label: "Food & Beverage" },
      { value: "service", label: "Services" },
      { value: "entertainment", label: "Entertainment" },
      { value: "luxury", label: "Luxury" },
      { value: "electronics", label: "Electronics" },
      { value: "fashion", label: "Fashion" },
    ],
    [],
  )

  // Optimize handlers with useCallback
  const handleOpenHoursChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("openHours", e.target.value),
    [onPropertyChange],
  )

  const handleIsClosedChange = useCallback(
    (checked: boolean) => onPropertyChange("isClosed", checked),
    [onPropertyChange],
  )

  const handleClosedDayChange = useCallback((value: string) => onPropertyChange("closedDay", value), [onPropertyChange])

  const handleCategoryChange = useCallback((value: string) => onPropertyChange("category", value), [onPropertyChange])

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="store-hours">Opening Hours</Label>
        <Input
          id="store-hours"
          placeholder="e.g. 10:00 AM - 9:00 PM"
          value={element.openHours || ""}
          onChange={handleOpenHoursChange}
        />
        <p className="text-xs text-muted-foreground">Format: 10:00 AM - 9:00 PM</p>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="store-closed">Store Closed</Label>
          <Switch id="store-closed" checked={element.isClosed || false} onCheckedChange={handleIsClosedChange} />
        </div>
        <p className="text-xs text-muted-foreground">Closed stores will appear grayed out on the map</p>
      </div>

      <div className="grid gap-2 mt-4">
        <Label htmlFor="store-closed-days">Closed Days</Label>
        <Select value={element.closedDay || "sunday"} onValueChange={handleClosedDayChange}>
          <SelectTrigger id="store-closed-days">
            <SelectValue placeholder="Select closed day" />
          </SelectTrigger>
          <SelectContent>
            {closedDays.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Day when the store is regularly closed</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="store-category">Store Category</Label>
        <Select value={element.category || "retail"} onValueChange={handleCategoryChange}>
          <SelectTrigger id="store-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {storeCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
})

// Event-specific properties component with enhanced fields
const EventProperties = memo(function EventProperties({
  element,
  onPropertyChange,
}: {
  element: EventElement
  onPropertyChange: (property: string, value: any) => void
}) {
  // Optimize handlers with useCallback
  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("start_date", e.target.value),
    [onPropertyChange],
  )

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("end_date", e.target.value),
    [onPropertyChange],
  )

  const handleStartTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("start_time", e.target.value),
    [onPropertyChange],
  )

  const handleEndTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("end_time", e.target.value),
    [onPropertyChange],
  )

  const handleIsActiveChange = useCallback(
    (checked: boolean) => onPropertyChange("is_active", checked),
    [onPropertyChange],
  )

  const handleEventDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => onPropertyChange("eventDescription", e.target.value),
    [onPropertyChange],
  )

  const handleHostChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("host", e.target.value),
    [onPropertyChange],
  )

  const handleCompanyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("company", e.target.value),
    [onPropertyChange],
  )

  const handleIsFocChange = useCallback((checked: boolean) => onPropertyChange("is_foc", checked), [onPropertyChange])

  // Check if event is currently active
  const isCurrentlyActive = useMemo(() => {
    if (!element.start_date || !element.end_date) return false
    const now = new Date()
    const startDate = new Date(element.start_date)
    const endDate = new Date(element.end_date)
    return now >= startDate && now <= endDate && element.is_active
  }, [element.start_date, element.end_date, element.is_active])

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="event-start-date">Start Date</Label>
        <Input id="event-start-date" type="date" value={element.start_date || ""} onChange={handleStartDateChange} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="event-end-date">End Date</Label>
        <Input id="event-end-date" type="date" value={element.end_date || ""} onChange={handleEndDateChange} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="event-start-time">Start Time</Label>
          <Input id="event-start-time" type="time" value={element.start_time || ""} onChange={handleStartTimeChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="event-end-time">End Time</Label>
          <Input id="event-end-time" type="time" value={element.end_time || ""} onChange={handleEndTimeChange} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="event-host">Host</Label>
        <Input id="event-host" value={element.host || ""} onChange={handleHostChange} placeholder="Event Host" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="event-company">Company</Label>
        <Input
          id="event-company"
          value={element.company || ""}
          onChange={handleCompanyChange}
          placeholder="Organizing Company"
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="event-active">Event Active</Label>
          <Switch id="event-active" checked={element.is_active || false} onCheckedChange={handleIsActiveChange} />
        </div>
        {isCurrentlyActive && (
          <div className="bg-green-100 text-green-800 text-xs p-2 rounded-md">
            This event is currently active and will be highlighted on the map.
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="event-foc">Free of Charge</Label>
          <Switch id="event-foc" checked={element.is_foc || false} onCheckedChange={handleIsFocChange} />
        </div>
        <p className="text-xs text-muted-foreground">
          {element.is_foc ? "This event is free for all attendees" : "This event requires payment or registration"}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="event-description">Event Description</Label>
        <textarea
          id="event-description"
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Describe the event"
          value={element.eventDescription || ""}
          onChange={handleEventDescriptionChange}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Last updated: {element.updated_at ? new Date(element.updated_at).toLocaleString() : "Never"}
      </div>
    </div>
  )
})

const AdvancedProperties = memo(function AdvancedProperties({
  element,
  onPropertyChange,
  totalFloors,
}: {
  element: MapElement
  onPropertyChange: (property: string, value: any) => void
  totalFloors: number
}) {
  // Generate floor options only once
  const floorOptions = useMemo(() => {
    return Array.from({ length: totalFloors }, (_, i) => ({
      value: (i + 1).toString(),
      label: `Floor ${i + 1}`,
    }))
  }, [totalFloors])

  // Memoize categories to prevent recreation on each render
  const categories = useMemo(
    () => [
      { value: "retail", label: "Retail" },
      { value: "food", label: "Food & Beverage" },
      { value: "service", label: "Services" },
      { value: "facility", label: "Facility" },
    ],
    [],
  )

  // Optimize handlers with useCallback
  const handleFloorChange = useCallback(
    (value: string) => onPropertyChange("floor", Number.parseInt(value)),
    [onPropertyChange],
  )

  const handleCategoryChange = useCallback((value: string) => onPropertyChange("category", value), [onPropertyChange])

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => onPropertyChange("notes", e.target.value),
    [onPropertyChange],
  )

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="element-floor">Floor</Label>
        <Select value={element.floor?.toString() || "1"} onValueChange={handleFloorChange}>
          <SelectTrigger id="element-floor">
            <SelectValue placeholder="Select floor" />
          </SelectTrigger>
          <SelectContent>
            {floorOptions.map((floor) => (
              <SelectItem key={floor.value} value={floor.value}>
                {floor.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-category">Category</Label>
        <Select value={element.category || "retail"} onValueChange={handleCategoryChange}>
          <SelectTrigger id="element-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-id">Element ID</Label>
        <Input id="element-id" value={element.id || ""} disabled />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-notes">Notes</Label>
        <textarea
          id="element-notes"
          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Add notes about this element"
          value={element.notes || ""}
          onChange={handleNotesChange}
        />
      </div>
    </div>
  )
})

export function PropertyPanel() {
  const { selectedElement, updateElement, removeElement, totalFloors } = useMapEditor()
  const [elementProperties, setElementProperties] = useState<MapElement | null>(null)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    if (selectedElement) {
      setElementProperties({ ...selectedElement })
    } else {
      setElementProperties(null)
    }
  }, [selectedElement])

  // Set appropriate tab based on element type
  useEffect(() => {
    if (selectedElement) {
      if (selectedElement.type === "store") {
        setActiveTab("store")
      } else if (
        selectedElement.type === "event" ||
        selectedElement.type === "banner" ||
        selectedElement.type === "promotion"
      ) {
        setActiveTab("event")
      } else {
        setActiveTab("general")
      }
    }
  }, [selectedElement])

  const handlePropertyChange = useCallback(
    (property: string, value: any) => {
      setElementProperties((prev) => {
        if (!prev) return null

        const updated = {
          ...prev,
          [property]: value,
          // Update the updated_at timestamp for events
          ...(prev.type === "event" ? { updated_at: new Date().toISOString() } : {}),
        }

        // Notify context of changes
        updateElement(updated)

        return updated
      })
    },
    [updateElement],
  )

  const handleDelete = useCallback(() => {
    if (selectedElement) {
      removeElement(selectedElement.id)
    }
  }, [selectedElement, removeElement])

  if (!elementProperties) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        <p>Select an element to edit its properties</p>
      </div>
    )
  }

  // Determine which tabs to show based on element type
  const showStoreTab = elementProperties.type === "store"
  const showEventTab = ["event", "banner", "promotion"].includes(elementProperties.type)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Properties</h3>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap w-full">
          <TabsTrigger value="general" className="flex-1">
            General
          </TabsTrigger>
          <TabsTrigger value="style" className="flex-1">
            Style
          </TabsTrigger>
          {showStoreTab && (
            <TabsTrigger value="store" className="flex-1">
              Store
            </TabsTrigger>
          )}
          {showEventTab && (
            <TabsTrigger value="event" className="flex-1">
              Event
            </TabsTrigger>
          )}
          <TabsTrigger value="advanced" className="flex-1">
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralProperties element={elementProperties} onPropertyChange={handlePropertyChange} />
        </TabsContent>

        <TabsContent value="style">
          <StyleProperties element={elementProperties} onPropertyChange={handlePropertyChange} />
        </TabsContent>

        {showStoreTab && (
          <TabsContent value="store">
            <StorePropertiesPanel element={elementProperties} onPropertyChange={handlePropertyChange} />
          </TabsContent>
        )}

        {showEventTab && (
          <TabsContent value="event">
            <EventProperties element={elementProperties} onPropertyChange={handlePropertyChange} />
          </TabsContent>
        )}

        <TabsContent value="advanced">
          <AdvancedProperties
            element={elementProperties}
            onPropertyChange={handlePropertyChange}
            totalFloors={totalFloors}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
