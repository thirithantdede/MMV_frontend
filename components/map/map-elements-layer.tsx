"use client"

import type React from "react"

import { memo } from "react"
import { MapElementComponent } from "@/components/map/map-element"
import type { MapElement } from "@/types"
import { useMapEditor } from "@/context/map-editor-context"

interface MapElementsLayerProps {
  elements: MapElement[]
  selectedElement: MapElement | null
  onElementClick: (e: React.MouseEvent, element: MapElement) => void
  onElementDragStart: (e: React.MouseEvent, element: MapElement) => void
  isEditingFootprint: boolean
  isGuestMode?: boolean
}

export const MapElementsLayer = memo(function MapElementsLayer({
  elements,
  selectedElement,
  onElementClick,
  onElementDragStart,
  isEditingFootprint,
  isGuestMode = false,
}: MapElementsLayerProps) {
  if (isEditingFootprint) return null
  const { mapSettings} = useMapEditor();

  return (
    <>
      {elements.map((element) => (
        <MapElementComponent
          key={element.id}
          element={element}
          isSelected={selectedElement?.id === element.id}
          onClick={(e) => onElementClick(e, element)}
          onDragStart={(e) => onElementDragStart(e, element)}
          isGuestMode={isGuestMode}
          mapsetting={mapSettings}
        />
      ))}
    </>
  )
})
