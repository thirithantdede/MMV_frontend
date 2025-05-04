"use client"

import { memo } from "react"
import { useMapEditor } from "@/context/map-editor-context"

export const FloatingFloorIndicator = memo(function FloatingFloorIndicator() {
  const { currentFloor, mapSettings } = useMapEditor()

  // Position it to the top right of the building footprint
  const positionX = mapSettings.buildingX + mapSettings.buildingWidth + 20
  const positionY = mapSettings.buildingY - 40

  return (
    <div
      className="absolute bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-10 font-bold text-lg"
      style={{
        left: positionX,
        top: positionY,
      }}
    >
      Floor {currentFloor}
    </div>
  )
})
