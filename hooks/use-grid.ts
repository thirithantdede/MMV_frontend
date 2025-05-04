"use client"

import { useMemo } from "react"
import type { MapSettings } from "@/types"

export function useGrid(mapSettings: MapSettings) {
  const { width, height, gridSize, showGrid } = mapSettings

  const gridLines = useMemo(() => {
    if (!showGrid) return []

    const lines = []

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      lines.push({
        key: `v-${x}`,
        x1: x,
        y1: 0,
        x2: x,
        y2: height,
      })
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      lines.push({
        key: `h-${y}`,
        x1: 0,
        y1: y,
        x2: width,
        y2: y,
      })
    }

    return lines
  }, [width, height, gridSize, showGrid])

  return gridLines
}
