"use client"

import { memo } from "react"
import { ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useMapEditor } from "@/context/map-editor-context"

interface ZoomControlsProps {
  showSlider?: boolean
}

export const ZoomControls = memo(function ZoomControls({ showSlider = false }: ZoomControlsProps) {
  const { zoomLevel, setZoomLevel, zoomIn, zoomOut } = useMapEditor()

  const percentage = Math.round(zoomLevel * 100)

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={zoomOut} disabled={zoomLevel <= 0.2}>
        <ZoomOut className="h-4 w-4" />
        <span className="sr-only">Zoom out</span>
      </Button>

      {showSlider && (
        <div className="flex items-center gap-2">
          <Slider
            value={[zoomLevel]}
            min={0.3}
            max={3}
            step={0.1}
            className="w-24"
            onValueChange={([value]) => setZoomLevel(value)}
          />
          <span className="text-xs font-medium w-12">{percentage}%</span>
        </div>
      )}

      {!showSlider && <span className="text-xs font-medium w-12 text-center">{percentage}%</span>}

      <Button variant="outline" size="icon" onClick={zoomIn} disabled={zoomLevel >= 3}>
        <ZoomIn className="h-4 w-4" />
        <span className="sr-only">Zoom in</span>
      </Button>
    </div>
  )
})
