"use client"

import { memo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ElementIcon } from "@/components/map/element-icon"

interface ElementTypeSelectorProps {
  value: string
  onValueChange: (value: string) => void
  id?: string
  disabled?: boolean
}

export const ElementTypeSelector = memo(function ElementTypeSelector({
  value,
  onValueChange,
  id = "element-type",
  disabled = false,
}: ElementTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id}>
        <div className="flex items-center gap-2">
          <ElementIcon type={value} className="h-4 w-4" />
          <SelectValue placeholder="Select type" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="store">
          <div className="flex items-center gap-2">
            <ElementIcon type="store" className="h-4 w-4" />
            <span>Store</span>
          </div>
        </SelectItem>
        <SelectItem value="elevator">
          <div className="flex items-center gap-2">
            <ElementIcon type="elevator" className="h-4 w-4" />
            <span>Elevator</span>
          </div>
        </SelectItem>
        <SelectItem value="escalator">
          <div className="flex items-center gap-2">
            <ElementIcon type="escalator" className="h-4 w-4" />
            <span>Escalator</span>
          </div>
        </SelectItem>
        <SelectItem value="stairs">
          <div className="flex items-center gap-2">
            <ElementIcon type="stairs" className="h-4 w-4" />
            <span>Stairs</span>
          </div>
        </SelectItem>
        <SelectItem value="room">
          <div className="flex items-center gap-2">
            <ElementIcon type="room" className="h-4 w-4" />
            <span>Room</span>
          </div>
        </SelectItem>
        <SelectItem value="pathway">
          <div className="flex items-center gap-2">
            <ElementIcon type="pathway" className="h-4 w-4" />
            <span>Pathway</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
})
