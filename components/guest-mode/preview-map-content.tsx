"use client"

import type React from "react"

import { memo } from "react"
import { MapElementComponent } from "@/components/map/map-element"
import { Grid } from "@/components/map/grid"
import { RoutePath } from "@/components/route-path"
import type { MapElement, MapSettings, RouteInfo } from "@/types"

// Update the interface to include the highlightedElement prop
interface PreviewMapContentProps {
  mapSettings: MapSettings
  floorElements: MapElement[]
  previewFloor: number
  zoomLevel: number
  routeInfo: RouteInfo
  onElementClick: (element: MapElement) => void
  containerRef: React.RefObject<HTMLDivElement>
  highlightedElement: MapElement | null // Add this prop
}

export const PreviewMapContent = memo(function PreviewMapContent({
  mapSettings,
  floorElements,
  previewFloor,
  zoomLevel,
  routeInfo,
  onElementClick,
  containerRef,
  highlightedElement, // Add this prop
}: PreviewMapContentProps) {
  return (
    <div ref={containerRef} className="h-full w-full overflow-auto pt-14 touch-manipulation">
      <div
        className="relative origin-top-left bg-white"
        style={{
          height: `${mapSettings.height}px`,
          width: `${mapSettings.width}px`,
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
        }}
      >
        <Grid mapSettings={mapSettings} />

        {/* Floor Walking Paths */}
        <FloorWalkingPaths mapSettings={mapSettings} previewFloor={previewFloor} />

        {/* Building Footprint */}
        <BuildingFootprint mapSettings={mapSettings} previewFloor={previewFloor} />

        {/* Route path visualization - moved before elements so it appears underneath */}
        {routeInfo.sourceStore && routeInfo.targetStore && (
          <RoutePath routeInfo={routeInfo} currentFloor={previewFloor} />
        )}

        {/* Map elements - with click handler for guest mode */}
        {floorElements.map((element) => (
          <div key={element.id} onClick={() => onElementClick(element)}>
            <MapElementComponent
              element={element}
              isSelected={false}
              onClick={() => onElementClick(element)}
              onDragStart={() => {}}
              isGuestMode={true}
              isHighlighted={highlightedElement?.id === element.id} // Add this prop
            />
          </div>
        ))}
      </div>
    </div>
  )
})

// Smaller components for better organization
const FloorWalkingPaths = memo(function FloorWalkingPaths({
  mapSettings,
  previewFloor,
}: {
  mapSettings: MapSettings
  previewFloor: number
}) {
  return (
    <div className="absolute" style={{ left: 0, top: 0 }}>
      {Array.from({ length: Math.floor(mapSettings.buildingHeight / mapSettings.gridSize) }).map((_, row) =>
        Array.from({ length: Math.floor(mapSettings.buildingWidth / mapSettings.gridSize) }).map((_, col) => (
          <div
            key={`floor-${previewFloor}-${row}-${col}`}
            className="absolute border border-gray-100"
            style={{
              left: mapSettings.buildingX + col * mapSettings.gridSize,
              top: mapSettings.buildingY + row * mapSettings.gridSize,
              width: mapSettings.gridSize,
              height: mapSettings.gridSize,
              backgroundColor: "rgba(240, 240, 240, 0.3)",
            }}
            data-walkable="true"
            data-floor={previewFloor}
            data-x={mapSettings.buildingX + col * mapSettings.gridSize}
            data-y={mapSettings.buildingY + row * mapSettings.gridSize}
          />
        )),
      )}
    </div>
  )
})

const BuildingFootprint = memo(function BuildingFootprint({
  mapSettings,
  previewFloor,
}: {
  mapSettings: MapSettings
  previewFloor: number
}) {
  return (
    <div
      className="absolute border-4 border-gray-800 bg-gray-50/30 pointer-events-none"
      style={{
        left: mapSettings.buildingX,
        top: mapSettings.buildingY,
        width: mapSettings.buildingWidth,
        height: mapSettings.buildingHeight,
        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-br">
        Building Footprint
      </div>

      {/* Floor 2 label - only show when on floor 2 */}
      {previewFloor === 2 && (
        <div className="absolute -top-8 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-md shadow-md">
          Floor 2
        </div>
      )}
    </div>
  )
})
