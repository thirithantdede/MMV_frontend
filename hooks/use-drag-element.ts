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
    (x: number, y: number, width: number, height: number, rotation: number = 0) => {
      if (!mapSettings.restricted) return true;

      const { building_x, building_y, building_width, building_height } = mapSettings;

      // Calculate effective dimensions based on rotation
      const isRotated = rotation === 90 || rotation === 270;
      const effectiveWidth = isRotated ? height : width;
      const effectiveHeight = isRotated ? width : height;

      // Assuming (x, y) is the top-left corner of the element
      const elementLeft = x;
      const elementTop = y;
      const elementRight = x + effectiveWidth;
      const elementBottom = y + effectiveHeight;

      // Check if element is completely within building bounds
      const withinBounds = (
        elementLeft >= building_x &&
        elementTop >= building_y &&
        elementRight <= building_x + building_width &&
        elementBottom <= building_y + building_height
      );

      return withinBounds;
    },
    [mapSettings]
  );

  const isOverlapping = useCallback(
    (x: number, y: number, width: number, height: number, elementId: string, rotation = 0) => {
      // Filter elements on current floor and global elements (floor 0), excluding the dragged element
      const floorElements = elements.filter((el) => 
        el.id !== elementId && (el.floor === currentFloor || el.floor === 0)
      );

      // Calculate effective dimensions for the dragged element
      const isRotated = rotation === 90 || rotation === 270;
      const effectiveWidth = isRotated ? height : width;
      const effectiveHeight = isRotated ? width : height;

      for (const element of floorElements) {
        // Calculate effective dimensions for the existing element
        const isElementRotated = element.rotation === 90 || element.rotation === 270;
        const elementEffectiveWidth = isElementRotated ? element.height : element.width;
        const elementEffectiveHeight = isElementRotated ? element.width : element.height;

        // Check for rectangle overlap
        const overlap = !(
          x >= element.x + elementEffectiveWidth ||
          x + effectiveWidth <= element.x ||
          y >= element.y + elementEffectiveHeight ||
          y + effectiveHeight <= element.y
        );

        if (overlap) {
          return true;
        }
      }

      return false;
    },
    [elements, currentFloor]
  );

  // Fixed border check for doors
  // Fixed border check for doors
const isOnBuildingBorder = useCallback(
  (x: number, y: number, width: number, height: number, rotation: number = 0) => {
    if (!mapSettings.restricted) return true;

    const { building_x, building_y, building_width, building_height } = mapSettings;
    const tolerance = 15;

    // Calculate effective dimensions
    const isRotated = rotation === 90 || rotation === 270;
    const effectiveWidth = isRotated ? height : width;
    const effectiveHeight = isRotated ? width : height;

    // Element boundaries
    const elementLeft = x;
    const elementTop = y;
    const elementRight = x + effectiveWidth;
    const elementBottom = y + effectiveHeight;

    // Building boundaries
    const buildingLeft = building_x;
    const buildingTop = building_y;
    const buildingRight = building_x + building_width;
    const buildingBottom = building_y + building_height;

    // Check if element touches any building border (with tolerance)
    const touchesLeftBorder = Math.abs(elementLeft - buildingLeft) <= tolerance;
    const touchesRightBorder = Math.abs(elementRight - buildingRight) <= tolerance;
    const touchesTopBorder = Math.abs(elementTop - buildingTop) <= tolerance;
    const touchesBottomBorder = Math.abs(elementBottom - buildingBottom) <= tolerance;

    // If it touches a border, check if it's reasonably within bounds
    if (touchesLeftBorder || touchesRightBorder || touchesTopBorder || touchesBottomBorder) {
      // For doors touching borders, we allow them to extend slightly outside
      const reasonablyWithinBounds = (
        elementLeft >= buildingLeft - tolerance &&
        elementTop >= buildingTop - tolerance &&
        elementRight <= buildingRight + tolerance &&
        elementBottom <= buildingBottom + tolerance
      );

      // Debug logging
      console.log('Door border check:', {
        elementBounds: { left: elementLeft, top: elementTop, right: elementRight, bottom: elementBottom },
        buildingBounds: { left: buildingLeft, top: buildingTop, right: buildingRight, bottom: buildingBottom },
        touches: {
          left: touchesLeftBorder,
          right: touchesRightBorder,
          top: touchesTopBorder,
          bottom: touchesBottomBorder
        },
        distances: {
          left: Math.abs(elementLeft - buildingLeft),
          right: Math.abs(elementRight - buildingRight),
          top: Math.abs(elementTop - buildingTop),
          bottom: Math.abs(elementBottom - buildingBottom)
        },
        reasonablyWithinBounds,
        finalResult: reasonablyWithinBounds
      });

      return reasonablyWithinBounds;
    }

    return false;
  },
  [mapSettings]
);


  const handleElementDragStart = useCallback((e: React.MouseEvent, element: MapElement) => {
    e.stopPropagation();
    e.preventDefault();

    setIsDragging(true);
    draggedElementRef.current = element;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    document.body.classList.add("dragging-element");

    return element;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, element: MapElement | null) => {
      if (!isDragging || !element || !mapRef.current) return;

      // Cancel any existing animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const mapRect = mapRef.current?.getBoundingClientRect();
        if (!mapRect) return;

        // Calculate new position with grid snapping
        const rawX = (e.clientX - mapRect.left - dragOffset.x) / zoomLevel;
        const rawY = (e.clientY - mapRect.top - dragOffset.y) / zoomLevel;
        
        const x = Math.round(rawX / gridSize) * gridSize;
        const y = Math.round(rawY / gridSize) * gridSize;
        
        const rotation = element.rotation || 0;

        // Validation based on element type
        let isValidPosition = false;

        if (element.type === "door") {
          // Doors must be on building border
          isValidPosition = isOnBuildingBorder(x, y, element.width, element.height, rotation);
          
          // Debug logging for doors (remove after testing)
          if (!isValidPosition) {
            console.log('Door position invalid:', { x, y, width: element.width, height: element.height, rotation });
          }
        } else {
          // Other elements must be within building and not overlap
          const withinBuilding = isWithinBuilding(x, y, element.width, element.height, rotation);
          const notOverlapping = !isOverlapping(x, y, element.width, element.height, element.id, rotation);
          isValidPosition = withinBuilding && notOverlapping;
        }

        if (isValidPosition) {
          onElementUpdate({
            ...element,
            x,
            y,
          });
        }
      });
    },
    [isDragging, dragOffset, gridSize, onElementUpdate, zoomLevel, isWithinBuilding, isOnBuildingBorder, isOverlapping]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    draggedElementRef.current = null;
    document.body.classList.remove("dragging-element");

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.body.classList.remove("dragging-element");
    };
  }, []);

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
  };
}
