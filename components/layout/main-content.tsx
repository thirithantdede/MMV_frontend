"use client"

import { memo } from "react"
import { PanelLeft, PanelRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FloorSelector } from "@/components/floor-selector"
import { ZoomControls } from "@/components/zoom-controls"
import { MapEditor } from "@/components/map/map-editor"
import { useMapEditor } from "@/context/map-editor-context"

interface MainContentProps {
  onToggleLeftPanel: () => void
  onToggleRightPanel: () => void
}

export const MainContent = memo(function MainContent({ onToggleLeftPanel, onToggleRightPanel }: MainContentProps) {
  const { isEditingFootprint } = useMapEditor()

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="absolute left-2 top-2 z-10">
        <Button variant="outline" size="icon" onClick={onToggleLeftPanel} className="bg-background">
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle left panel</span>
        </Button>
      </div>
      <div className="absolute right-2 top-2 z-10">
        <Button variant="outline" size="icon" onClick={onToggleRightPanel} className="bg-background">
          <PanelRight className="h-4 w-4" />
          <span className="sr-only">Toggle right panel</span>
        </Button>
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
        <FloorSelector />
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <ZoomControls />
      </div>

      {isEditingFootprint && (
        <div className="absolute top-12 left-1/2 z-10 -translate-x-1/2 transform bg-background/90 px-4 py-2 rounded-md shadow-md">
          <p className="text-sm font-medium text-primary">Building Footprint Edit Mode</p>
          <p className="text-xs text-muted-foreground">Drag handles to resize or move the building footprint</p>
        </div>
      )}

      <MapEditor />
    </div>
  )
})
