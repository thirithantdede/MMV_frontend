import { MapElement } from "@/types"
import { memo, useCallback, useMemo } from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  export default AdvancedProperties