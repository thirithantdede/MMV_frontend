"use client"

import type React from "react"

import { useCallback, useMemo, useRef} from "react"
import { useDrop } from "react-dnd"
import type { EventElement, MapElement } from "@/types"
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
import { useHandleBehavior } from "@/hooks/use-handle-behavior"
import { Toaster } from "../ui/toaster"
import { accept } from "@/utils/global"

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
    isEditingFootprint,
  } = useMapEditor()

  useKeyboardShortcuts()

  const mapContainerRef = useRef<HTMLDivElement>(null)

  const { containerRef } = useHandleBehavior()

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
    gridSize: mapSettings.grid_size,
    onElementUpdate: updateElement,
    zoomLevel,
    mapSettings,
    elements,
    currentFloor,
  })

  // Filter elements for current floor - memoized for performance
  const currentFloorElements = useMemo(
    () => elements.filter((element) =>( element.floor == currentFloor || element.floor == 0)),
    [elements, currentFloor],
  )

  // Memoize drop target configuration
    const [{ isOver, canDrop }, drop] = useDrop(
      () => ({
        accept: accept,
        canDrop: (item: any, monitor) => {
          if (isEditingFootprint) return false

          const mapRect = mapRef.current?.getBoundingClientRect()
          if (!mapRect) return false

          const clientOffset = monitor.getClientOffset()
          if (!clientOffset) return false

          // Adjust for zoom level
          const x = Math.floor((clientOffset.x - mapRect.left) / zoomLevel / mapSettings.grid_size) * mapSettings.grid_size
          const y = Math.floor((clientOffset.y - mapRect.top) / zoomLevel / mapSettings.grid_size) * mapSettings.grid_size
          const width = item.defaultWidth || 100
          const height = item.defaultHeight || 100
          const rotation = item.rotation || 0

          // Special case for doors - they must be on the building border
          if (item.type === "door") {
            return isOnBuildingBorder(x, y, width, height,rotation)
          }

          // Check if the new element would overlap with existing elements
          if (isOverlapping(x, y, width, height, "new-element",rotation)) {
            return false
          }
          return isWithinBuilding(x, y, width, height,rotation)
        },
        drop: (item: any, monitor) => {
          if (isEditingFootprint) return

          const mapRect = mapRef.current?.getBoundingClientRect()
          if (!mapRect) return

          const clientOffset = monitor.getClientOffset()
          if (!clientOffset) return

          // Adjust for zoom level
          const x = Math.floor((clientOffset.x - mapRect.left) / zoomLevel / mapSettings.grid_size) * mapSettings.grid_size
          const y = Math.floor((clientOffset.y - mapRect.top) / zoomLevel / mapSettings.grid_size) * mapSettings.grid_size
          const width = item.defaultWidth || 100
          const height = item.defaultHeight || 100
          const rotation = item.rotation || 0

          // Special case for doors - they must be on the building border
          if (item.type === "door" && !isOnBuildingBorder(x, y, width, height,rotation)) {
            return
          }

          // Check if the new element would overlap with existing elements
          if (isOverlapping(x, y, width, height, "new-element",rotation)) {
            return
          }

          // For other elements, they must be within the building footprint
          if (item.type !== "door" && !isWithinBuilding(x, y, width, height,rotation)) {
            return
          }

          // Create additional fields for event type
          const additionalFields =
            item.type === "event"
              ? {
                  title : "New Event",
                  description : "This is a new event.",
                  start_date: new Date().toISOString().split("T")[0],
                  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
                  start_time: "09:00",
                  end_time: "18:00",
                  company: "Company Name",
                  hosts: "Rapper 1 , Rapper 2",
                  is_active: true,
                  is_foc: false,
                  is_featured: false,
                } as EventElement
              : {}

          const isTransportationElement = ["elevator", "escalator", "stairs"].includes(item.type)
          const floor = isTransportationElement ? 0 : currentFloor

          const newElement: MapElement = {
            id: `new_element-${Date.now()}`,
            type: item.type,
            x,
            y,
            width,
            height,
            name: item.name || `New ${item.type}`,
            color: item.color || "#e2e8f0",
            border_color: item.border_color || "#e2e8f0",
            border_style: "solid",
            floor: floor,
            walkable: item.type === "floor" || item.type === "pathway",
            border_radius :{
              bottomRight:0,
              bottomLeft:0,
              topRight:0,
              topLeft:0
            },
            isSynced:false,
            isDeleted:false,
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
      className="relative w-full h-full  overflow-auto bg-white will-change-transform touch-manipulation"
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
        className="relative origin-top-left  "
        style={{
          height: `${(mapSettings.height ) + (mapSettings.building_width * (zoomLevel / 2)) }px`,
          width: `${(mapSettings.width  ) + (mapSettings.building_width * (zoomLevel / 2))}px`,
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

      <Toaster />
      {/* Map controls */}
      <MapControls isEditingFootprint={isEditingFootprint} />
    </div>
  )
}
