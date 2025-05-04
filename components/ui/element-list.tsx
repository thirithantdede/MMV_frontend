"use client"

import { memo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ElementIcon } from "@/components/map/element-icon"
import type { MapElement } from "@/types"

interface ElementListProps {
  elements: MapElement[]
  onElementClick: (element: MapElement) => void
  selectedElementId?: string
  disabledElementId?: string
  emptyMessage?: string
  maxHeight?: string
}

export const ElementList = memo(function ElementList({
  elements,
  onElementClick,
  selectedElementId,
  disabledElementId,
  emptyMessage = "No elements found",
  maxHeight = "300px",
}: ElementListProps) {
  return (
    <ScrollArea className={`border rounded-md p-2`} style={{ maxHeight }}>
      {elements.length > 0 ? (
        <div className="space-y-1">
          {elements.map((element) => (
            <div
              key={element.id}
              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                selectedElementId === element.id ? "bg-primary/10" : "hover:bg-muted"
              } ${disabledElementId === element.id ? "opacity-50" : ""}`}
              onClick={() => onElementClick(element)}
            >
              <ElementIcon type={element.type} className="h-4 w-4" />
              <span>{element.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {element.type.charAt(0).toUpperCase() + element.type.slice(1)} • Floor {element.floor}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full py-8 text-muted-foreground">{emptyMessage}</div>
      )}
    </ScrollArea>
  )
})
