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
  const { building_width, building_height, building_x, building_y, grid_size,show_grid } = mapSettings



  // Generate grid of walkable floor tiles
  const floorTiles = useMemo(() => {
    const tiles = []
    const cols = Math.floor(building_width / grid_size)
    const rows = Math.floor(building_height / grid_size)
    console.log(cols,rows)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        
        const x = building_x + col * grid_size
        const y = building_y + row * grid_size

        tiles.push({
          id: `floor-${currentFloor}-${row}-${col}`,
          x,
          y,
          size: grid_size,
        })
      }
    }

    return tiles
  }, [building_x, building_y, building_width, building_height, grid_size, currentFloor])

  return (
    <div className="absolute pointer-events-none" style={{ left: 0, top: 0 }}>
      {show_grid && floorTiles.map((tile) => (
        <div
          key={tile.id}
          className="absolute border border-gray-100"
          style={{
            left: tile.x,
            top: tile.y,
            width: tile.size,
            height: tile.size,
            backgroundColor: "",
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
