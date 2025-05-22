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
    (x: number, y: number, width: number, height: number,rotation : number) => {
      if (!mapSettings.restricted) return true

      const { building_x, building_y, building_width, building_height } = mapSettings

      // For 90° and 270° rotations, swap width and height for boundary check
      const isRotated = rotation === 90 || rotation === 270
      const effectiveWidth = isRotated ? height : width
      const effectiveHeight = isRotated ? width : height

       return (
        x >= building_x &&
        y >= building_y &&
        x + effectiveWidth <= building_x + building_width &&
        y + effectiveHeight <= building_y + building_height
      )
    },
    [mapSettings],
  )

  const isOverlapping = useCallback(
    (x: number, y: number, width: number, height: number, elementId: string, rotation = 0) => {
      // Only check elements on the current floor
      const floorElements = elements.filter((el) => el.floor === currentFloor && el.id !== elementId)

      // For 90° and 270° rotations, swap width and height for overlap check
      const isRotated = rotation === 90 || rotation === 270
      const effectiveWidth = isRotated ? height : width
      const effectiveHeight = isRotated ? width : height

      for (const element of floorElements) {
        // Check if the other element is rotated
        const isElementRotated = element.rotation === 90 || element.rotation === 270
        const elementEffectiveWidth = isElementRotated ? element.height : element.width
        const elementEffectiveHeight = isElementRotated ? element.width : element.height

        // Check if rectangles overlap using effective dimensions
        if (
          x < element.x + elementEffectiveWidth &&
          x + effectiveWidth > element.x &&
          y < element.y + elementEffectiveHeight &&
          y + effectiveHeight > element.y
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
      const { building_x, building_y, building_width, building_height,restricted} = mapSettings

      const allowX = [90,270];
      const allowY = [0,180];

      const midX = building_x + (building_width / 2);
      const midY = building_y + (building_height / 2);
      const isLeft = x < midX;
      const isTop = y < midY;

      let currentX = x;
      let currentY = y;
      let currentbuilding_x = building_x;
      let toleranceX = 10;

      if (allowX.includes(rotation)) {
        currentX = isLeft ? x + width - height  : x - width + height;
        toleranceX = isLeft ? 30 : 80;
        currentbuilding_x = isLeft ? building_x : building_x ; 
      } else if (allowY.includes(rotation)) {
        currentY = isTop ? currentY : currentY  ;
      }


      if (!isWithinBuilding(currentX, currentY, width, height,rotation)){
        console.log('out of buiding');
        return false
      }
      // Check if the element touches any of the building borders
      const touchesLeftBorder = Math.abs(currentX - currentbuilding_x) < toleranceX
      const touchesRightBorder = Math.abs(currentX + height - (currentbuilding_x + building_width+height)) < toleranceX
      const touchesTopBorder = Math.abs(y - building_y) < 5
      const touchesBottomBorder = Math.abs((currentY + height) - (building_y + building_height)) < 10

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
            !isWithinBuilding(x, y, element.width, element.height,rotation) ||
            isOverlapping(x, y, element.width, element.height, element.id,rotation)
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
