"use client"

import { memo } from "react"
import type { MapSettings } from "@/types"

interface DropIndicatorProps {
  isOver: boolean
  canDrop: boolean
  mapSettings: MapSettings
  isEditingFootprint: boolean
}

export const DropIndicator = memo(function DropIndicator({
  isOver,
  canDrop,
  mapSettings,
  isEditingFootprint,
}: DropIndicatorProps) {
  if (!isOver || isEditingFootprint) return null

  return (
    <div
      className={`absolute pointer-events-none ${canDrop ? "bg-primary/10" : "bg-destructive/10"}`}
      style={{
        left: mapSettings.buildingX,
        top: mapSettings.buildingY,
        width: mapSettings.buildingWidth,
        height: mapSettings.buildingHeight,
        inset: "unset",
      }}
    />
  )
})
