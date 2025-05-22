"use client"

import type React from "react"

import { useRef, useState, useCallback, memo, useMemo } from "react"
import { useDrop } from "react-dnd"
import { Store, CableCarIcon as Escalator, CableCarIcon as Elevator, RouteIcon as Road } from "lucide-react"
import { MapElement } from "@/types"

interface MapEditorProps {
  currentFloor: number
  selectedElement: any
  onElementSelect: (element: any) => void
  elements: MapElement[]
  setElements: React.Dispatch<React.SetStateAction<MapElement[]>>
  mapWidth: number
  mapHeight: number
  onMapSizeChange?: (width: number, height: number) => void
}

// Memoized map element component for better performance
const MapElementComponent = memo(
  ({
    element,
    isSelected,
    onClick,
    onDragStart,
  }: {
    element: MapElement
    isSelected: boolean
    onClick: (e: React.MouseEvent) => void
    onDragStart: (e: React.MouseEvent) => void
  }) => {
    // Render element icon based on type
    const renderElementIcon = (type: string) => {
      switch (type) {
        case "store":
          return <Store className="h-6 w-6" />
        case "elevator":
          return <Elevator className="h-6 w-6" />
        case "escalator":
          return <Escalator className="h-6 w-6" />
        case "pathway":
          return <Road className="h-6 w-6" />
        default:
          return null
      }
    }

    return (
      <div
        className={`absolute flex flex-col items-center justify-center rounded-md border-2 ${
          isSelected ? "border-primary" : "border-gray-300"
        } cursor-move overflow-hidden`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          backgroundColor: element.color,
          borderTopLeftRadius:element.border_radius.topLeft,
          borderTopRightRadius:element.border_radius.topRight,
          borderBottomRightRadius:element.border_radius.bottomRight,
          borderBottomLeftRadius: element.border_radius.bottomLeft,
          transform: "translate3d(0,0,0)", // Force GPU acceleration
        }}
        onClick={onClick}
        onMouseDown={onDragStart}
      >
        {renderElementIcon(element.type)}
        <span className="mt-1 text-xs font-medium">{element.name}</span>
      </div>
    )
  },
)

MapElementComponent.displayName = "MapElementComponent"

export function MapEditor({
  currentFloor,
  selectedElement,
  onElementSelect,
  elements,
  setElements,
  mapWidth = 2000,
  mapHeight = 1500,
  onMapSizeChange,
}: MapEditorProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const gridSize = 20

  // Memoize the filtered elements to prevent unnecessary recalculations
  const currentFloorElements = useMemo(
     () => elements.filter((element) => element.floor === currentFloor || element.floor === 0),
     [elements, currentFloor],
   )
 

  // Handle dropped elements
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ["store", "elevator", "escalator", "room", "pathway"],
      drop: (item: any, monitor) => {
        const mapRect = mapRef.current?.getBoundingClientRect()
        if (!mapRect) return

        const clientOffset = monitor.getClientOffset()
        if (!clientOffset) return

        const x = Math.floor((clientOffset.x - mapRect.left) / gridSize) * gridSize
        const y = Math.floor((clientOffset.y - mapRect.top) / gridSize) * gridSize

        const newElement: MapElement = {
          id: `element-${Date.now()}`,
          type: item.type,
          x,
          y,
          width: item.defaultWidth || 100,
          height: item.defaultHeight || 100,
          name: item.name || `New ${item.type}`,
          color: item.color || "#e2e8f0",
          floor: currentFloor,
          border_style:"solid",
          border_radius :{
            bottomRight:0,
            bottomLeft:0,
            topRight:0,
            topLeft:0
          },
          isSynced:false
        }

        setElements((prev) => [...prev, newElement])
        onElementSelect(newElement)
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [currentFloor, gridSize, setElements, onElementSelect],
  )

  // Handle element selection - memoized for performance
  const handleElementClick = useCallback(
    (e: React.MouseEvent, element: MapElement) => {
      e.stopPropagation()
      onElementSelect(element)
    },
    [onElementSelect],
  )

  // Handle element dragging - memoized for performance
  const handleElementDragStart = useCallback(
    (e: React.MouseEvent, element: MapElement) => {
      e.stopPropagation()
      setIsDragging(true)
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      onElementSelect(element)
    },
    [onElementSelect],
  )

  // Handle element movement - optimized with requestAnimationFrame
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !selectedElement) return

      const mapRect = mapRef.current?.getBoundingClientRect()
      if (!mapRect) return

      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        const x = Math.floor((e.clientX - mapRect.left - dragOffset.x) / gridSize) * gridSize
        const y = Math.floor((e.clientY - mapRect.top - dragOffset.y) / gridSize) * gridSize

        setElements((prev) =>
          prev.map((el) => {
            if (el.id === selectedElement.id) {
              return { ...el, x, y }
            }
            return el
          }),
        )
      })
    },
    [isDragging, selectedElement, dragOffset, gridSize, setElements],
  )

  // Handle element drop - memoized for performance
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Clear selection when clicking on the map - memoized for performance
  const handleMapClick = useCallback(() => {
    onElementSelect(null)
  }, [onElementSelect])

  const renderGrid = useCallback(() => {
    if (!showGrid) return null

    const gridLines = []

    // Vertical lines
    for (let x = 0; x <= mapWidth; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={mapHeight}
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeDasharray="2,2"
        />,
      )
    }

    // Horizontal lines
    for (let y = 0; y <= mapHeight; y += gridSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={mapWidth}
          y2={y}
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeDasharray="2,2"
        />,
      )
    }

    return <svg className="absolute inset-0 h-full w-full pointer-events-none">{gridLines}</svg>
  }, [showGrid, gridSize, mapWidth, mapHeight])

  return (
    <div
      ref={(node) => {
        drop(node)
        mapRef.current = node as HTMLDivElement
      }}
      className="relative h-full w-full overflow-hidden bg-white will-change-transform"
      onClick={handleMapClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
      }}
    >
      <div className="relative" style={{ height: `${mapHeight}px`, width: `${mapWidth}px` }}>
        {renderGrid()}

        {/* Floor indicator */}
        <div className="absolute right-4 top-4 rounded-md bg-background p-2 shadow-md">
          <span className="font-medium">Floor {currentFloor}</span>
        </div>

        {/* Map elements - using memoized component for better performance */}
        {currentFloorElements.map((element) => (
          <MapElementComponent
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onClick={(e) => handleElementClick(e, element)}
            onDragStart={(e) => handleElementDragStart(e, element)}
          />
        ))}

        {isOver && <div className="absolute inset-0 bg-primary/10 pointer-events-none" />}
      </div>
    </div>
  )
}
