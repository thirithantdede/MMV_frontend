"use client"

import type React from "react"
import { memo, useMemo, useCallback } from "react"
import { MapElementComponent } from "@/components/map/map-element"
import { Grid } from "@/components/map/grid"
import { RoutePath } from "@/components/route-path"
import type { MapElement, MapSettings, RouteInfo } from "@/types"

interface PreviewMapContentProps {
  mapSettings: MapSettings
  floorElements: MapElement[]
  currentFloor: number
  zoomLevel: number
  routeInfo: RouteInfo
  onElementClick: (element: MapElement) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  highlightedElement: MapElement | null
}

export const PreviewMapContent = memo(function PreviewMapContent({
  mapSettings,
  floorElements,
  currentFloor,
  zoomLevel,
  routeInfo,
  onElementClick,
  containerRef,
  highlightedElement,
}: PreviewMapContentProps) {
  
  // Memoize transform style to prevent recalculation
  const transformStyle = useMemo(() => ({
    height: `${mapSettings.height}px`,
    width: `${mapSettings.width}px`,
    transform: `scale(${zoomLevel})`,
    transformOrigin: "top left",
    willChange: "transform",
  }), [mapSettings.height, mapSettings.width, zoomLevel]);

  // Memoize element click handler
  const handleElementClick = useCallback((element: MapElement) => {
    onElementClick(element);
  }, [onElementClick]);

  // Memoize whether to show route
  const showRoute = useMemo(() => {
    return routeInfo.sourceStore && routeInfo.targetStore;
  }, [routeInfo.sourceStore, routeInfo.targetStore]);

  return (
    <div 
      ref={containerRef} 
      className="relative h-full w-full overflow-auto bg-white will-change-transform touch-manipulation"
    >
      <div
        className="relative origin-top-left bg-white"
        style={transformStyle}
      >
        <Grid mapSettings={mapSettings} />
        {/* Floor Walking Paths */}
        <FloorWalkingPaths mapSettings={mapSettings} currentFloor={currentFloor} />

        {/* Building Footprint */}
        <BuildingFootprint mapSettings={mapSettings} currentFloor={currentFloor} />

        {/* Route path visualization - moved before elements so it appears underneath */}
        {showRoute && (
          <RoutePath routeInfo={routeInfo} currentFloor={currentFloor} mapSettings={mapSettings} />
        )}

        {/* Map elements - with click handler for guest mode */}
        {floorElements.map((element) => (
          <MapElementComponent
            key={element.id}
            element={element}
            isSelected={false}
            onClick={() => handleElementClick(element)}
            onDragStart={() => {}}
            isGuestMode={true}
            isHighlighted={highlightedElement?.id === element.id}
          />
        ))}
      </div>
    </div>
  )
})

// Optimized FloorWalkingPaths component with reduced DOM elements
const FloorWalkingPaths = memo(function FloorWalkingPaths({
  mapSettings,
  currentFloor,
}: {
  mapSettings: MapSettings
  currentFloor: number
}) {
  // Memoize grid calculations
  const gridConfig = useMemo(() => {
    if (!mapSettings.show_grid) return null;
    
    const rows = Math.floor(mapSettings.building_height / mapSettings.grid_size);
    const cols = Math.floor(mapSettings.building_width / mapSettings.grid_size);
    
    return { rows, cols };
  }, [mapSettings.show_grid, mapSettings.building_height, mapSettings.building_width, mapSettings.grid_size]);

  // Memoize grid style
  const gridStyle = useMemo(() => ({
    left: mapSettings.building_x,
    top: mapSettings.building_y,
    width: mapSettings.building_width,
    height: mapSettings.building_height,
    backgroundColor: "rgba(240, 240, 240, 0.3)",
    backgroundImage: mapSettings.show_grid ? 
      `linear-gradient(to right, rgba(200, 200, 200, 0.3) 1px, transparent 1px),
       linear-gradient(to bottom, rgba(200, 200, 200, 0.3) 1px, transparent 1px)` : 'none',
    backgroundSize: `${mapSettings.grid_size}px ${mapSettings.grid_size}px`,
  }), [mapSettings]);

  if (!gridConfig) return null;

  return (
    <div 
      className="absolute border border-gray-100"
      style={gridStyle}
      data-walkable="true"
      data-floor={currentFloor}
      data-x={mapSettings.building_x}
      data-y={mapSettings.building_y}
    />
  );
});

// Optimized BuildingFootprint component
const BuildingFootprint = memo(function BuildingFootprint({
  mapSettings,
  currentFloor,
}: {
  mapSettings: MapSettings
  currentFloor: number
}) {
  // Memoize building style
  const buildingStyle = useMemo(() => ({
    left: mapSettings.building_x,
    top: mapSettings.building_y,
    width: mapSettings.building_width,
    height: mapSettings.building_height,
    boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.1)",
  }), [mapSettings.building_x, mapSettings.building_y, mapSettings.building_width, mapSettings.building_height]);

  return (
    <div
      className="absolute border-4 border-gray-800 bg-gray-50/30 pointer-events-none"
      style={buildingStyle}
    >
      <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-br">
        Building Footprint
      </div>
      <div className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-3 py-1 rounded-md shadow-md">
        Floor {currentFloor}
      </div>
    </div>
  );
});
