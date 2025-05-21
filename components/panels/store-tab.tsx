import { MainElement } from "@/types"
import { memo, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "../ui/switch"


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