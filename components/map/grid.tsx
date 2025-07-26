"use client"

import { memo, useMemo } from "react"
import { useGrid } from "@/hooks/use-grid"
import type { MapSettings } from "@/types"

interface GridProps {
  mapSettings: MapSettings
}

export const Grid = memo(function Grid({ mapSettings }: GridProps) {
  const gridLines = useGrid(mapSettings)

  const clipPath = useMemo(() => {
    if (!mapSettings.show_grid) return "" // Return empty string if grid is not shown
    const { building_x, building_y, building_width, building_height, grid_size } = mapSettings
    return `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%,
      0% 0%, 
      ${building_x * grid_size}px ${building_y * grid_size}px, 
      ${building_x * grid_size}px ${building_y + building_height * grid_size}px, 
      ${building_x + building_width * grid_size}px ${building_y + building_height * grid_size}px, 
      ${building_x + building_width * grid_size}px ${building_y * grid_size}px, 
      ${building_x * grid_size}px ${building_y * grid_size}px, 
      0% 0%
    )`
  }, [mapSettings])

  if (!mapSettings.show_grid || gridLines.length === 0) {
    return null
  }

  return (
    <svg className="absolute inset-0 h-full w-full pointer-events-none">
      <defs>
        <clipPath id="grid-clip-path">
          <path d={clipPath} />
        </clipPath>
      </defs>
      <g clipPath="url(#grid-clip-path)">
        {gridLines.map((line) => (
          <line
            key={line.key}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}
      </g>
    </svg>
  )
})
