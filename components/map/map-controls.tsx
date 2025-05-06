"use client"

import { memo } from "react"

interface MapControlsProps {
  isEditingFootprint: boolean
}

export const MapControls = memo(function MapControls({ isEditingFootprint }: MapControlsProps) {
  return (
    <>
      {isEditingFootprint && (
        <div className="absolute top-12 left-1/2 z-10 -translate-x-1/2 transform bg-background/90 px-4 py-2 rounded-md shadow-md">
          <p className="text-sm font-medium text-primary">Building Footprint Edit Mode</p>
          <p className="text-xs text-muted-foreground">Drag handles to resize or move the building footprint</p>
        </div>
      )}
    </>
  )
})
