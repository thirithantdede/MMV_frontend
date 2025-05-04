"use client"

import { memo, useMemo } from "react"
import type { MapSettings } from "@/types"

interface FloorWalkingPathsProps {
  mapSettings: MapSettings
  currentFloor: number
}

export const FloorWalkingPaths = memo(function FloorWalkingPaths({
  mapSettings,
  currentFloor,
}: FloorWalkingPathsProps) {
  const { buildingX, buildingY, buildingWidth, buildingHeight, gridSize } = mapSettings

  // Generate grid of walkable floor tiles
  const floorTiles = useMemo(() => {
    const tiles = []
    const cols = Math.floor(buildingWidth / gridSize)
    const rows = Math.floor(buildingHeight / gridSize)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = buildingX + col * gridSize
        const y = buildingY + row * gridSize

        tiles.push({
          id: `floor-${currentFloor}-${row}-${col}`,
          x,
          y,
          size: gridSize,
        })
      }
    }

    return tiles
  }, [buildingX, buildingY, buildingWidth, buildingHeight, gridSize, currentFloor])

  return (
    <div className="absolute pointer-events-none" style={{ left: 0, top: 0 }}>
      {floorTiles.map((tile) => (
        <div
          key={tile.id}
          className="absolute border border-gray-100"
          style={{
            left: tile.x,
            top: tile.y,
            width: tile.size,
            height: tile.size,
            backgroundColor: "rgba(240, 240, 240, 0.3)",
          }}
          data-walkable="true"
          data-floor={currentFloor}
          data-x={tile.x}
          data-y={tile.y}
        />
      ))}
    </div>
  )
})
