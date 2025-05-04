"use client"

import { memo } from "react"
import { useMapEditor } from "@/context/map-editor-context"

export const BuildingFootprint = memo(function BuildingFootprint() {
  const { mapSettings, currentFloor } = useMapEditor()
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
      <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-br">
        Building Footprint
      </div>

      {/* Floor 2 label - only show when on floor 2 */}
      {currentFloor === 2 && (
        <div className="absolute -top-8 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-md shadow-md">
          Floor 2
        </div>
      )}
    </div>
  )
})
