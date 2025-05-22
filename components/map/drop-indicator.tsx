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
      className={`absolute pointer-events-none ${canDrop ? "bg-green-400/10" : "bg-destructive/30"}`}
      style={{
        left: mapSettings.building_x,
        top: mapSettings.building_y,
        width: mapSettings.building_width,
        height: mapSettings.building_height,
      }}
    />
  )
})
