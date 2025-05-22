"use client"

import type React from "react"
import { memo } from "react"
import { ElementIcon } from "@/components/map/element-icon"
import { ElementBadges } from "@/components/map/element-badges"
import type { MapElement } from "@/types"

interface MapElementProps {
  element: MapElement
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
  onDragStart: (e: React.MouseEvent) => void
  isGuestMode?: boolean
  isHighlighted?: boolean
}

export const MapElementComponent = memo(function MapElementComponent({
  element,
  isSelected,
  onClick,
  onDragStart,
  isGuestMode = false,
  isHighlighted = false,
}: MapElementProps) {
  const isVerticalTransport = ["elevator", "escalator", "stairs"].includes(element.type)
  const isClosed = element.is_closed || false

  return (
    <div
      className={`absolute flex flex-col items-center justify-center rounded-md border-2 ${
        isSelected ? "border-primary" : isHighlighted ? "border-green-500 border-4" : "border-gray-300"
      } ${isGuestMode ? "cursor-pointer" : "cursor-move"} overflow-hidden select-none ${
        isClosed ? "grayscale opacity-70" : ""
      } map-element ${isHighlighted ? "animate-pulse-slow" : ""} ${
        isVerticalTransport ? "floor-transition-element" : ""
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        backgroundColor: element.color,
        opacity: element.opacity ? element.opacity / 100 : 1,
        borderTopLeftRadius:`${element.border_radius.topLeft}px`,
        borderTopRightRadius:`${element.border_radius.topRight}px`,
        borderBottomRightRadius:`${element.border_radius.bottomRight}px`,
        borderBottomLeftRadius: `${element.border_radius.bottomLeft}px`,
        borderStyle: element.border_style || "solid",
        transform: element.rotation ? `rotate(${element.rotation}deg) translate3d(0,0,0)` : "translate3d(0,0,0)",
        willChange: "transform, left, top, opacity",
        userSelect: "none",
        boxShadow: isHighlighted ? "0 0 15px rgba(34, 197, 94, 0.7)" : undefined,
      }}
      onClick={onClick}
      onMouseDown={isGuestMode ? undefined : onDragStart}
    >
      <ElementIcon type={element.type} />
      <span className="mt-1 text-xs font-medium pointer-events-none">{element.name}</span>
      <ElementBadges element={element} />
    </div>
  )
})
