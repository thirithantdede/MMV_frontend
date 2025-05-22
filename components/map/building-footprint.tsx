"use client"

import { memo } from "react"
import { useMapEditor } from "@/context/map-editor-context"

export const BuildingFootprint = memo(function BuildingFootprint() {
  const { mapSettings } = useMapEditor()
  const { building_width, building_height, building_x, building_y } = mapSettings

  return (
    <div
      className="absolute border-4 border-gray-800 bg-gray-50/30 pointer-events-none"
      style={{
        left: building_x,
        top: building_y,
        width: building_width,
        height: building_height,
        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="absolute -top-8 -left-1 bg-gray-800 text-white text-sm px-2 py-1 rounded-br">
        Building Footprint
      </div>
    </div>
  )
})
