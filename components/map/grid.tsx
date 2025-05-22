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
    if (!mapSettings.showGrid) return "" // Return empty string if grid is not shown
    const { building_x, building_y, building_width, building_height } = mapSettings
    return `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%,
      0% 0%, 
      ${building_x}px ${building_y}px, 
      ${building_x}px ${building_y + building_height}px, 
      ${building_x + building_width}px ${building_y + building_height}px, 
      ${building_x + building_width}px ${building_y}px, 
      ${building_x}px ${building_y}px, 
      0% 0%
    )`
  }, [mapSettings])

  if (!mapSettings.showGrid || gridLines.length === 0) {
    return null
  }

  // Create a clip path to exclude the building footprint area

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
