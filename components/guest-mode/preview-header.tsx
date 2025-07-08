"use client"

import { memo, useState } from "react"
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, CalendarDays, Ticket, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ElementSearch } from "@/components/guest-mode/store-search"
import type { MapElement } from "@/types"
import { useMapEditor } from "@/context/map-editor-context"

interface PreviewHeaderProps {
  onExitPreview: () => void
  isGuestView: boolean
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
  isGuestView,
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
  const { project } = useMapEditor()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleStoreSelect = (store: MapElement) => {
    onStoreSelect(store)
    setIsSheetOpen(false)
  }

  const handleEventsClick = () => {
    onOpenEventsDialog()
    setIsSheetOpen(false)
  }

  const handlePromotionsClick = () => {
    onOpenPromotionsDialog()
    setIsSheetOpen(false)
  }

  // Floor navigation component (reused in both desktop and mobile)
  const FloorNavigation = () => (
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
  )

  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md p-3">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-2">
          {!isGuestView ? (
            <Button variant="ghost" onClick={onExitPreview} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Exit Preview
            </Button>
          ) : (
            <p>
              <b className="ps-3 capitalize">{project.name}</b>
              <span className="text-gray-500"> ( v{project.current_version} ) </span>
            </p>
          )}

          {/* Desktop Controls */}
          <div className="flex items-center gap-2">
            <ElementSearch onElementSelect={onStoreSelect} />
            <FloorNavigation />
            <Button variant="outline" onClick={onOpenPromotionsDialog} className="gap-2 bg-transparent">
              <Ticket className="h-4 w-4" />
              Promotions
            </Button>
            <Button variant="outline" onClick={onOpenEventsDialog} className="gap-2 bg-transparent">
              <CalendarDays className="h-4 w-4" />
              Events
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          {/* Left side - Exit button or Project name */}
          {!isGuestView ? (
            <Button variant="ghost" onClick={onExitPreview} className="gap-2 p-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Exit</span>
            </Button>
          ) : (
            <div className="flex-1 min-w-0">
              <p className="truncate">
                <b className="capitalize">{project.name}</b>
                <span className="text-gray-500 text-sm"> v{project.current_version}</span>
              </p>
            </div>
          )}

          {/* Right side - Floor navigation and menu */}
          <div className="flex items-center gap-2">
            <FloorNavigation />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4 mt-6">
                  {/* Search */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Search Stores</h3>
                    <ElementSearch onElementSelect={handleStoreSelect} />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
                    <Button
                      variant="outline"
                      onClick={handlePromotionsClick}
                      className="w-full justify-start gap-2 bg-transparent"
                    >
                      <Ticket className="h-4 w-4" />
                      Promotions
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleEventsClick}
                      className="w-full justify-start gap-2 bg-transparent"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Events
                    </Button>
                  </div>

                  {/* Explore */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium mb-2">Explore</h3>
                    <Button
                      variant="outline"
                      onClick={()=>window.location.href = "/explore"}
                      className="w-full justify-start gap-2 bg-transparent"
                    >
                      Back To Home Page
                    </Button>
               
                  </div>

                  {/* Floor Info */}
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <p>
                        Current Floor: <span className="font-medium">{currentFloor}</span>
                      </p>
                      <p>
                        Total Floors: <span className="font-medium">{totalFloors}</span>
                      </p>
                      {hasRouteOnOtherFloors && <p className="text-blue-600 mt-1">Route continues on other floors</p>}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  )
})
