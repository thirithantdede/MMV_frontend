"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useMapEditor } from "@/context/map-editor-context"
import { PreviewHeader } from "@/components/guest-mode/preview-header"
import { PreviewMapContent } from "@/components/guest-mode/preview-map-content"
import { RouteButton } from "@/components/guest-mode/route-button"
import { RouteCancelButton } from "@/components/guest-mode/route-cancel-button"
import { FloorRouteNotification } from "@/components/guest-mode/floor-route-notification"
import { LazyRouteDialog, LazyElementDetails } from "@/components/guest-mode/lazy-dialogs"
import { EventsPanel } from "@/components/events/events-panel"
import { PromotionsList } from "@/components/guest-mode/promotions-list"
import type { MapElement, RouteInfo } from "@/types"
import FloatInfo from "./guest-mode/float-info"

export function PreviewMode({ onExitPreview,isGuestView = false }: { onExitPreview: () => void,isGuestView?:boolean }) {
  const { elements, mapSettings, currentFloor, totalFloors,setCurrentFloor } = useMapEditor()
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showInfo, setShowInfo] = useState(true)
  const [showRouteDialog, setShowRouteDialog] = useState(false)
  const [showEventsDialog, setShowEventsDialog] = useState(false)
  const [showPromotionsDialog, setShowPromotionsDialog] = useState(false)
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null)
  const [showElementDetails, setShowElementDetails] = useState(false)
  const [routeInfo, setRouteInfo] = useState<RouteInfo>({
    sourceStore: null,
    targetStore: null,
    path: [],
    algorithm: undefined,
  })
  // Add a new state variable for highlighted element
  const [highlightedElement, setHighlightedElement] = useState<MapElement | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x1: number; y1: number; x2: number; y2: number; dist: number } | null>(null)

  // Filter elements for current floor
  const floorElements =  useMemo(
      () => {
        console.log("Filtering elements for floor:", currentFloor)
        return elements.filter((element) => element.floor === currentFloor || element.floor === 0)
      },
      [elements, currentFloor],
    )

  // Add floor transition state
  const [isFloorTransitioning, setIsFloorTransitioning] = useState(false)

  // Check if there's an active route
  const hasActiveRoute = useMemo(() => routeInfo.path.length > 0, [routeInfo.path])

  // Floor navigation
  const goToNextFloor = useCallback(() => {
    if (currentFloor < totalFloors && !isFloorTransitioning) {
      setIsFloorTransitioning(true)
      setCurrentFloor(currentFloor + 1);
      setIsFloorTransitioning(false)
    }
  }, [currentFloor, totalFloors, isFloorTransitioning])

  const goToPrevFloor = useCallback(() => {
    if (currentFloor > 1 && !isFloorTransitioning) {
      setIsFloorTransitioning(true)
      setCurrentFloor(currentFloor - 1);

      setIsFloorTransitioning(false)
    }
  }, [currentFloor, isFloorTransitioning])

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

  // Handle route planning
  const handleOpenRouteDialog = useCallback(() => {
    setShowRouteDialog(true)
  }, [])

  // Handle element click in guest mode
  const handleElementClick = useCallback((element: MapElement) => {
    setSelectedElement(element)
    setShowElementDetails(true)
  }, [])

  // Updated to accept the pre-calculated path
  const handleRouteSelect = useCallback(
    (source: MapElement | null, target: MapElement | null, path: any[], algorithm?: string) => {
      setRouteInfo({
        sourceStore: source,
        targetStore: target,
        path: path,
        algorithm: algorithm,
      })

      // If the route starts on a different floor, automatically switch to that floor
      if (source && source.floor !== currentFloor) {
        setCurrentFloor(source.floor)
      }
    },
    [currentFloor],
  )

  // Add handler for canceling route
  const handleCancelRoute = useCallback(() => {
    setRouteInfo({
      sourceStore: null,
      targetStore: null,
      path: [],
      algorithm: undefined,
    })
  }, [])

  // Handle opening events dialog
  const handleOpenEventsDialog = useCallback(() => {
    setShowEventsDialog(true)
  }, [])

  // Add handlers for the new features
  const handleOpenPromotionsDialog = useCallback(() => {
    setShowPromotionsDialog(true)
  }, [])

  // Modify the handleStoreSelect function to automatically show details and highlight
  const handleStoreSelect = useCallback(
    (store: MapElement) => {
      // If the store is on a different floor, switch to that floor
      if (store.floor !== currentFloor) {
        setCurrentFloor(store.floor)
      }

      // Highlight the store
      setHighlightedElement(store)

      // Automatically show element details
      setSelectedElement(store)
      // setShowElementDetails(true)

      // Clear the highlight after 3 seconds
      setTimeout(() => {
        setHighlightedElement(null)
      }, 10000)
    },
    [currentFloor],
  )

  // Auto-hide info panel after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInfo(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

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

  // Check if there's a route on another floor that the user should see
  const hasRouteOnOtherFloors = useMemo(()=> routeInfo.path.some((point) => point.floor !== currentFloor) && routeInfo.path.length > 0, [routeInfo.path, currentFloor])

  // Memoize the header component to improve performance
  const MemoizedHeader = useMemo(
    () => (
      <PreviewHeader
        isGuestView={isGuestView}
        onExitPreview={onExitPreview}
        currentFloor={currentFloor}
        totalFloors={totalFloors}
        goToPrevFloor={goToPrevFloor}
        goToNextFloor={goToNextFloor}
        isFloorTransitioning={isFloorTransitioning}
        hasRouteOnOtherFloors={hasRouteOnOtherFloors}
        onOpenEventsDialog={handleOpenEventsDialog}
        onOpenPromotionsDialog={handleOpenPromotionsDialog}
        onStoreSelect={handleStoreSelect}
      />
    ),
    [
      onExitPreview,
      currentFloor,
      totalFloors,
      goToPrevFloor,
      goToNextFloor,
      isFloorTransitioning,
      hasRouteOnOtherFloors,
      handleOpenEventsDialog,
      handleOpenPromotionsDialog,
      handleStoreSelect,
    ],
  )


  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">
      {/* Header with search - now memoized */}
      {MemoizedHeader}

      {/* Route button */}
      <RouteButton onOpenRouteDialog={handleOpenRouteDialog} />

      {/* Cancel Route button - only shown when a route is active */}
      <RouteCancelButton onCancelRoute={handleCancelRoute} visible={hasActiveRoute} />

      {/* Info panel */}
      {showInfo && (
        <div className="absolute top-28 left-1/2 z-10 -translate-x-1/2 transform bg-black/70 text-white px-4 py-2 rounded-md text-sm">
          You are viewing the mall map as a guest. Click on elements to see details.
        </div>
      )}

      {/* Map content */}
      <PreviewMapContent
        mapSettings={mapSettings}
        floorElements={floorElements}
        currentFloor={currentFloor}
        zoomLevel={zoomLevel}
        routeInfo={routeInfo}
        onElementClick={handleElementClick}
        containerRef={containerRef}
        highlightedElement={highlightedElement}
      />

      {/* Lazy loaded dialogs */}
      {showRouteDialog && (
        <LazyRouteDialog
          open={showRouteDialog}
          onOpenChange={setShowRouteDialog}
          elements={elements}
          onRouteSelect={handleRouteSelect}
          isGuestMode={true}
        />
      )}

      {showElementDetails && selectedElement && (
        <LazyElementDetails
          element={selectedElement}
          open={showElementDetails}
          onOpenChange={setShowElementDetails}
          onViewEvents={() => {
            setShowElementDetails(false)
            setShowEventsDialog(true)
          }}
        />
      )}

      {/* Events panel */}
      <EventsPanel open={showEventsDialog} onOpenChange={setShowEventsDialog}  />

      {/* Promotions list */}
      <PromotionsList
        open={showPromotionsDialog}
        onOpenChange={setShowPromotionsDialog}
        onStoreSelect={handleStoreSelect}
      />


      <FloatInfo routeInfo={routeInfo} currentFloor={currentFloor} />

      {/* Notification for routes that span multiple floors */}
      <FloorRouteNotification path={routeInfo.path} currentFloor={currentFloor} show={hasRouteOnOtherFloors} />
    </div>
  )
}
