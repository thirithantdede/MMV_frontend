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
  
  
    // Optimize handlers with useCallback
    const handleFloorChange = useCallback(
      (value: string) => onPropertyChange("floor", Number.parseInt(value)),
      [onPropertyChange],
    )
  
  
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
          <Label htmlFor="element-id">Element ID</Label>
          <Input id="element-id" className="text-red-700 cursor-not-allowed" value={element?.shop_information?.readable_id || element.id} />
        </div>

           <div className="grid gap-2">
          <Label htmlFor="element-id">Token</Label>
          <Input id="element-id" className="text-red-700 cursor-not-allowed" value={element?.shop_information?.id || element.id}  />
        </div>
  
      </div>
    )
  })

  export default AdvancedProperties