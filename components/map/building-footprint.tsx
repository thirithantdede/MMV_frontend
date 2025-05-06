"use client"

import { memo } from "react"
import { useMapEditor } from "@/context/map-editor-context"

export const BuildingFootprint = memo(function BuildingFootprint() {
  const { mapSettings } = useMapEditor()
  const { buildingWidth, buildingHeight, buildingX, buildingY } = mapSettings

  return (
    <div
      className="absolute border-4 border-gray-800 bg-gray-50/30 pointer-events-none"
      style={{
        left: buildingX,
        top: buildingY,
        width: buildingWidth,
        height: buildingHeight,
        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="absolute -top-8 -left-1 bg-gray-800 text-white text-sm px-2 py-1 rounded-br">
        Building Footprint
      </div>
    </div>
  )
})
