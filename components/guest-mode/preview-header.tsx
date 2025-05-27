"use client"

import { memo } from "react"
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, CalendarDays, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ElementSearch } from "@/components/guest-mode/store-search"
import type { MapElement } from "@/types"

interface PreviewHeaderProps {
  onExitPreview: () => void
  currentFloor: number
  totalFloors: number
  goToPrevFloor: () => void
  goToNextFloor: () => void
  isFloorTransitioning: boolean
  hasRouteOnOtherFloors: boolean
  onOpenEventsDialog: () => void
  onOpenPromotionsDialog: () => void
  onStoreSelect: (store: MapElement) => void
}

export const PreviewHeader = memo(function PreviewHeader({
  onExitPreview,
  currentFloor,
  totalFloors,
  goToPrevFloor,
  goToNextFloor,
  isFloorTransitioning,
  hasRouteOnOtherFloors,
  onOpenEventsDialog,
  onOpenPromotionsDialog,
  onStoreSelect,
}: PreviewHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md p-3">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={onExitPreview} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Exit Preview
        </Button>

        {/* Floor navigation */}


        <div className="flex items-center gap-2">

        <ElementSearch onElementSelect={onStoreSelect} />


        <div className="bg-white rounded-md border-[1px] flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevFloor}
            disabled={currentFloor <= 1 || isFloorTransitioning}
            className={hasRouteOnOtherFloors && currentFloor > 1 ? "animate-bounce-gentle" : ""}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <span className="font-medium px-2">
            {isFloorTransitioning ? (
              <div className="flex items-center gap-1 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              `Floor ${currentFloor}`
            )}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextFloor}
            disabled={currentFloor >= totalFloors || isFloorTransitioning}
            className={hasRouteOnOtherFloors && currentFloor < totalFloors ? "animate-bounce-gentle" : ""}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        
          <Button variant="outline" onClick={onOpenPromotionsDialog} className="gap-2">
            <Ticket className="h-4 w-4" />
            Promotions
          </Button>
          <Button variant="outline" onClick={onOpenEventsDialog} className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Events
          </Button>
        </div>
      </div>
    </div>
  )
})
