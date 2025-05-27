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
  currentFloor: number
  zoomLevel: number
  routeInfo: RouteInfo
  onElementClick: (element: MapElement) => void
  containerRef: React.RefObject<HTMLDivElement>
  highlightedElement: MapElement | null // Add this prop
}

export const PreviewMapContent = memo(function PreviewMapContent({
  mapSettings,
  floorElements,
  currentFloor,
  zoomLevel,
  routeInfo,
  onElementClick,
  containerRef,
  highlightedElement, // Add this prop
}: PreviewMapContentProps) {
  return (
    <div ref={containerRef} className="relative h-full w-full overflow-auto bg-white will-change-transform touch-manipulation">
      <div
        className="relative origin-top-left bg-white"
        style={{
          height: `${mapSettings.height}px`,
          width: `${mapSettings.width}px`,
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
          willChange: "transform",
        }}
      >
        <Grid mapSettings={mapSettings} />

        {/* Floor Walking Paths */}
        <FloorWalkingPaths mapSettings={mapSettings} currentFloor={currentFloor} />

        {/* Building Footprint */}
        <BuildingFootprint mapSettings={mapSettings} currentFloor={currentFloor} />

        {/* Route path visualization - moved before elements so it appears underneath */}
        {routeInfo.sourceStore && routeInfo.targetStore && (
          <RoutePath routeInfo={routeInfo} currentFloor={currentFloor} />
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
  currentFloor,
}: {
  mapSettings: MapSettings
  currentFloor: number
}) {
  return (
    <div className="absolute" style={{ left: 0, top: 0 }}>
      {Array.from({ length: Math.floor(mapSettings.building_height / mapSettings.grid_size) }).map((_, row) =>
        Array.from({ length: Math.floor(mapSettings.building_width / mapSettings.grid_size) }).map((_, col) => (
          <div
            key={`floor-${currentFloor}-${row}-${col}`}
            className="absolute border border-gray-100"
            style={{
              left: mapSettings.building_x + col * mapSettings.grid_size,
              top: mapSettings.building_y + row * mapSettings.grid_size,
              width: mapSettings.grid_size,
              height: mapSettings.grid_size,
              backgroundColor: "rgba(240, 240, 240, 0.3)",
            }}
            data-walkable="true"
            data-floor={currentFloor}
            data-x={mapSettings.building_x + col * mapSettings.grid_size}
            data-y={mapSettings.building_y + row * mapSettings.grid_size}
          />
        )),
      )}
    </div>
  )
})

const BuildingFootprint = memo(function BuildingFootprint({
  mapSettings,
  currentFloor,
}: {
  mapSettings: MapSettings
  currentFloor: number
}) {
  return (
    <div
      className="absolute border-4 border-gray-800 bg-gray-50/30 pointer-events-none"
      style={{
        left: mapSettings.building_x,
        top: mapSettings.building_y,
        width: mapSettings.building_width,
        height: mapSettings.building_height,
        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-br">
        Building Footprint
      </div>

    {      
        <div className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-3 py-1 rounded-md shadow-md">
          Floor {currentFloor}
        </div>
      }
    </div>
  )
})
