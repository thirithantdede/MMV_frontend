"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import type { MapElement, MapSettings } from "@/types"

interface UseDragElementProps {
  gridSize: number
  onElementUpdate: (element: MapElement) => void
  zoomLevel: number
  mapSettings: MapSettings
  elements: MapElement[]
  currentFloor: number
}

export function useDragElement({
  gridSize,
  onElementUpdate,
  zoomLevel,
  mapSettings,
  elements,
  currentFloor,
}: UseDragElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const draggedElementRef = useRef<MapElement | null>(null)

  // Check if position is within building footprint
  const isWithinBuilding = useCallback(
    (x: number, y: number, width: number, height: number) => {
      if (!mapSettings.restrictToBuilding) return true

      const { buildingX, buildingY, buildingWidth, buildingHeight } = mapSettings

      return (
        x >= buildingX &&
        y >= buildingY &&
        x + width <= buildingX + buildingWidth &&
        y + height <= buildingY + buildingHeight
      )
    },
    [mapSettings],
  )

  // Check if position overlaps with other elements
  const isOverlapping = useCallback(
    (x: number, y: number, width: number, height: number, elementId: string) => {
      // Only check elements on the current floor
      const floorElements = elements.filter((el) => (el.floor === currentFloor && el.id !== elementId) || el.floor == 0 && el.id !== elementId)

      for (const element of floorElements) {
        // Check if rectangles overlap
        if (
          x < element.x + element.width &&
          x + width > element.x &&
          y < element.y + element.height &&
          y + height > element.y
        ) {
          return true
        }
      }

      return false
    },
    [elements, currentFloor],
  )

  // Check if position is on building border (for doors)
  const isOnBuildingBorder = useCallback(
    (x: number, y: number, width: number, height: number,rotation : number) => {
      const { buildingX, buildingY, buildingWidth, buildingHeight,restrictToBuilding} = mapSettings

      const allowX = [90,270];
      const allowY = [0,180];

      const midX = buildingX + (buildingWidth / 2);
      const midY = buildingY + (buildingHeight / 2);
      const isLeft = x < midX;
      const isTop = y < midY;

      let currentX = x;
      let currentY = y;
      let currentBuildingX = buildingX;
      let toleranceX = 10;

      if (allowX.includes(rotation)) {
        currentX = isLeft ? x + height : x - height;
        toleranceX = isLeft ? 20 : 80;
        currentBuildingX = isLeft ? buildingX : buildingX ; 
      } else if (allowY.includes(rotation)) {
        currentY = isTop ? currentY : currentY - (height / 2) ;
      }

      if (!isWithinBuilding(currentX, currentY, width, height)){
        return false
      }
      // Check if the element touches any of the building borders
      const touchesLeftBorder = Math.abs(currentX - currentBuildingX) < toleranceX
      const touchesRightBorder = Math.abs(currentX + height - (currentBuildingX + buildingWidth+height)) < toleranceX
      const touchesTopBorder = Math.abs(y - buildingY) < 5
      const touchesBottomBorder = Math.abs((currentY + height) - (buildingY + buildingHeight)) < 10

      return touchesLeftBorder || touchesRightBorder || touchesTopBorder || touchesBottomBorder
    },
    [mapSettings, isWithinBuilding],
  )

  const handleElementDragStart = useCallback((e: React.MouseEvent, element: MapElement) => {
    e.stopPropagation()
    e.preventDefault() // Prevent text selection

    setIsDragging(true)
    draggedElementRef.current = element

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })

    // Add a global class to disable text selection during drag
    document.body.classList.add("dragging-element")

    return element
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, element: MapElement | null) => {
      if (!isDragging || !element || !mapRef.current) return

      // Cancel any existing animation frame to prevent queuing
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      // Use requestAnimationFrame for smoother updates
      rafRef.current = requestAnimationFrame(() => {
        const mapRect = mapRef.current?.getBoundingClientRect()
        if (!mapRect) return

        // Adjust for zoom level
        const x = Math.floor((e.clientX - mapRect.left - dragOffset.x) / zoomLevel / gridSize) * gridSize
        const y = Math.floor((e.clientY - mapRect.top - dragOffset.y) / zoomLevel / gridSize) * gridSize
        const rotation = element.rotation || 0

        // Special case for doors - they must stay on the building border
        if (element.type === "door") {
          if (!isOnBuildingBorder(x, y, element.width, element.height, rotation)) {
            return
          }
        } else {
          // For other elements, they must stay within the building footprint
          // and not overlap with other elements
          if (
            !isWithinBuilding(x, y, element.width, element.height) ||
            isOverlapping(x, y, element.width, element.height, element.id)
          ) {
            return
          }
        }

        onElementUpdate({
          ...element,
          x,
          y,
        })
      })
    },
    [isDragging, dragOffset, gridSize, onElementUpdate, zoomLevel, isWithinBuilding, isOnBuildingBorder, isOverlapping],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    draggedElementRef.current = null

    // Remove the global class when drag ends
    document.body.classList.remove("dragging-element")

    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      document.body.classList.remove("dragging-element")
    }
  }, [])

  return {
    isDragging,
    mapRef,
    handleElementDragStart,
    handleMouseMove,
    handleMouseUp,
    isWithinBuilding,
    isOnBuildingBorder,
    isOverlapping,
    draggedElementRef,
  }
}
