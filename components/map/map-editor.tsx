"use client"

import type React from "react"

import { useCallback, useMemo, useRef, useEffect, useState } from "react"
import { useDrop } from "react-dnd"
import type { MapElement } from "@/types"
import { useMapEditor } from "@/context/map-editor-context"
import { useDragElement } from "@/hooks/use-drag-element"
import { Grid } from "@/components/map/grid"
import { BuildingFootprintEditor } from "@/components/map/building-footprint-editor"
import { BuildingFootprint } from "@/components/map/building-footprint"
import { FloorWalkingPaths } from "@/components/map/floor-walking-paths"
import { FloatingFloorIndicator } from "@/components/map/floor-indicator"
import { MapElementsLayer } from "@/components/map/map-elements-layer"
import { MapControls } from "@/components/map/map-controls"
import { DropIndicator } from "@/components/map/drop-indicator"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

// Optimize MapEditor component with better memoization and performance improvements

export function MapEditor() {
  const {
    elements,
    addElement,
    updateElement,
    selectedElement,
    setSelectedElement,
    currentFloor,
    mapSettings,
    zoomLevel,
    setZoomLevel,
    isEditingFootprint,
  } = useMapEditor()

  useKeyboardShortcuts()

  const containerRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x1: number; y1: number; x2: number; y2: number; dist: number } | null>(null)
  const [isValid, setIsValid] = useState(false)

  // Drag and drop handling
  const {
    isDragging,
    mapRef,
    handleElementDragStart,
    handleMouseMove,
    handleMouseUp,
    isWithinBuilding,
    isOnBuildingBorder,
    isOverlapping,
    draggedElementRef,
  } = useDragElement({
    gridSize: mapSettings.gridSize,
    onElementUpdate: updateElement,
    zoomLevel,
    mapSettings,
    elements,
    currentFloor,
  })

  // Filter elements for current floor - memoized for performance
  const currentFloorElements = useMemo(
    () => elements.filter((element) => element.floor === currentFloor || element.floor === 0),
    [elements, currentFloor],
  )

  // Memoize drop target configuration
    const [{ isOver, canDrop }, drop] = useDrop(
      () => ({
        accept: ["store", "elevator", "escalator", "room", "pathway", "door", "floor", "event","stairs"],
        canDrop: (item: any, monitor) => {
          if (isEditingFootprint) return false

          const mapRect = mapRef.current?.getBoundingClientRect()
          if (!mapRect) return false

          const clientOffset = monitor.getClientOffset()
          if (!clientOffset) return false

          // Adjust for zoom level
          const x = Math.floor((clientOffset.x - mapRect.left) / zoomLevel / mapSettings.gridSize) * mapSettings.gridSize
          const y = Math.floor((clientOffset.y - mapRect.top) / zoomLevel / mapSettings.gridSize) * mapSettings.gridSize
          const width = item.defaultWidth || 100
          const height = item.defaultHeight || 100
          const rotation = item.rotation || 0

          // Special case for doors - they must be on the building border
          if (item.type === "door") {
            return isOnBuildingBorder(x, y, width, height,rotation)
          }

          // Check if the new element would overlap with existing elements
          if (isOverlapping(x, y, width, height, "new-element")) {
            return false
          }
          isWithinBuilding(x, y, width, height) ? setIsValid(true) : setIsValid(false)
          return isWithinBuilding(x, y, width, height)
        },
        drop: (item: any, monitor) => {
          if (isEditingFootprint) return

          const mapRect = mapRef.current?.getBoundingClientRect()
          if (!mapRect) return

          const clientOffset = monitor.getClientOffset()
          if (!clientOffset) return

          // Adjust for zoom level
          const x = Math.floor((clientOffset.x - mapRect.left) / zoomLevel / mapSettings.gridSize) * mapSettings.gridSize
          const y = Math.floor((clientOffset.y - mapRect.top) / zoomLevel / mapSettings.gridSize) * mapSettings.gridSize
          const width = item.defaultWidth || 100
          const height = item.defaultHeight || 100
          const rotation = item.rotation || 0

          // Special case for doors - they must be on the building border
          if (item.type === "door" && !isOnBuildingBorder(x, y, width, height,rotation)) {
            return
          }

          // Check if the new element would overlap with existing elements
          if (isOverlapping(x, y, width, height, "new-element")) {
            return
          }

          // For other elements, they must be within the building footprint
          if (item.type !== "door" && !isWithinBuilding(x, y, width, height)) {
            return
          }

          // Create additional fields for event type
          const additionalFields =
            item.type === "event"
              ? {
                  start_date: new Date().toISOString().split("T")[0],
                  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
                  start_time: "09:00",
                  end_time: "18:00",
                  is_active: true,
                  host: "",
                  company: "",
                  is_foc: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              : {}

          const isTransportationElement = ["elevator", "escalator", "stairs"].includes(item.type)
          const floor = isTransportationElement ? 0 : currentFloor

          const newElement: MapElement = {
            id: `element-${Date.now()}`,
            type: item.type,
            x,
            y,
            width,
            height,
            name: item.name || `New ${item.type}`,
            color: item.color || "#e2e8f0",
            floor: floor,
            walkable: item.type === "floor" || item.type === "pathway",
            ...additionalFields,
          }

          addElement(newElement)
          setSelectedElement(newElement)
        },
        collect: (monitor) => ({
          isOver: !!monitor.isOver(),
          canDrop: !!monitor.canDrop(),
        }),
      }),
      [
        currentFloor,
        mapSettings,
        addElement,
        setSelectedElement,
        mapRef,
        zoomLevel,
        isWithinBuilding,
        isOnBuildingBorder,
        isOverlapping,
        isEditingFootprint,
      ],
    )

  // Handle element selection - memoized
  const handleElementClick = useCallback(
    (e: React.MouseEvent, element: MapElement) => {
      if (isEditingFootprint) return
      e.stopPropagation()
      setSelectedElement(element)
    },
    [setSelectedElement, isEditingFootprint],
  )

  // Handle element dragging - memoized
  const handleElementDragStartWithSelection = useCallback(
    (e: React.MouseEvent, element: MapElement) => {
      if (isEditingFootprint) return
      e.preventDefault() // Prevent text selection
      setSelectedElement(element)
      handleElementDragStart(e, element)
    },
    [setSelectedElement, handleElementDragStart, isEditingFootprint],
  )

  // Clear selection when clicking on the map - memoized
  const handleMapClick = useCallback(() => {
    if (!isEditingFootprint) {
      setSelectedElement(null)
    }
  }, [setSelectedElement, isEditingFootprint])

  // Handle mouse move for dragging - memoized
  const handleMapMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditingFootprint && isDragging) {
        handleMouseMove(e, selectedElement)
      }
    },
    [handleMouseMove, selectedElement, isEditingFootprint, isDragging],
  )

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoomLevel((prev) => Math.max(0.3, Math.min(3, prev + delta)))
      }
    },
    [setZoomLevel],
  )

  // Handle touch events for pinch-to-zoom
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)

      touchStartRef.current = {
        x1: touch1.clientX,
        y1: touch1.clientY,
        x2: touch2.clientX,
        y2: touch2.clientY,
        dist,
      }
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartRef.current) {
        e.preventDefault() // Prevent default browser behavior (like page zoom)

        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
        const initialDist = touchStartRef.current.dist

        // Calculate zoom factor based on pinch distance
        const zoomDelta = (currentDist - initialDist) * 0.01
        setZoomLevel((prev) => Math.max(0.3, Math.min(3, prev + zoomDelta)))

        // Update the reference distance for the next move event
        touchStartRef.current.dist = currentDist
      }
    },
    [setZoomLevel],
  )

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null
  }, [])

  // Center the map when zoom changes
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const scrollWidth = container.scrollWidth
      const scrollHeight = container.scrollHeight
      const clientWidth = container.clientWidth
      const clientHeight = container.clientHeight

      // Center the scroll position
      container.scrollLeft = (scrollWidth - clientWidth) / 2
      container.scrollTop = (scrollHeight - clientHeight) / 2
    }
  }, [zoomLevel])

  // Set up event listeners for wheel and touch events
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      // Add passive: false to prevent default browser zoom behavior
      container.addEventListener("wheel", handleWheel, { passive: false })
      container.addEventListener("touchstart", handleTouchStart, { passive: false })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd)

      return () => {
        container.removeEventListener("wheel", handleWheel)
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd])

  // Memoize the drop target ref assignment
  const setDropTargetRef = useCallback(
    (node: HTMLDivElement | null) => {
      drop(node)
      if (node) {
        mapRef.current = node
        mapContainerRef.current = node
      }
    },
    [drop, mapRef],
  )

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-auto bg-white will-change-transform touch-manipulation"
      onClick={handleMapClick}
      onMouseMove={handleMapMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
      }}
    >
      <div
        ref={setDropTargetRef}
        className="relative origin-top-left"
        style={{
          height: `${mapSettings.height}px`,
          width: `${mapSettings.width}px`,
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
          willChange: "transform", // Optimize for animations
        }}
      >
        {/* Static components */}
        <Grid mapSettings={mapSettings} />
        <BuildingFootprint />
        <BuildingFootprintEditor />

        {/* Floor-specific components */}
        <FloorWalkingPaths mapSettings={mapSettings} currentFloor={currentFloor} />
        <FloatingFloorIndicator />

        {/* Map elements */}
        <MapElementsLayer
          elements={currentFloorElements}
          selectedElement={selectedElement}
          onElementClick={handleElementClick}
          onElementDragStart={handleElementDragStartWithSelection}
          isEditingFootprint={isEditingFootprint}
        />

        {/* Drop indicator */}
        <DropIndicator
          isOver={isOver}
          canDrop={canDrop}
          mapSettings={mapSettings}
          isEditingFootprint={isEditingFootprint}
        />
      </div>

      {/* Map controls */}
      <MapControls isEditingFootprint={isEditingFootprint} />
    </div>
  )
}
