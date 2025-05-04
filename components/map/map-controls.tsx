"use client"

import { memo } from "react"
import { ZoomControls } from "@/components/zoom-controls"

interface MapControlsProps {
  isEditingFootprint: boolean
}

export const MapControls = memo(function MapControls({ isEditingFootprint }: MapControlsProps) {
  return (
    <>
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <ZoomControls />
      </div>

      {isEditingFootprint && (
        <div className="absolute top-12 left-1/2 z-10 -translate-x-1/2 transform bg-background/90 px-4 py-2 rounded-md shadow-md">
          <p className="text-sm font-medium text-primary">Building Footprint Edit Mode</p>
          <p className="text-xs text-muted-foreground">Drag handles to resize or move the building footprint</p>
        </div>
      )}
    </>
  )
})
