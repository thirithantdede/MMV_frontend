"use client"

import { useState } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MapSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapWidth: number
  mapHeight: number
  onSave: (width: number, height: number) => void
}

export function MapSettingsDialog({ open, onOpenChange, mapWidth, mapHeight, onSave }: MapSettingsDialogProps) {
  const [width, setWidth] = useState(mapWidth)
  const [height, setHeight] = useState(mapHeight)

  const handleSave = () => {
    // Ensure minimum dimensions
    const finalWidth = Math.max(width, 800)
    const finalHeight = Math.max(height, 600)

    onSave(finalWidth, finalHeight)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Map Settings</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="map-width" className="col-span-1">
              Width (px)
            </Label>
            <Input
              id="map-width"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={800}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="map-height" className="col-span-1">
              Height (px)
            </Label>
            <Input
              id="map-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={600}
              className="col-span-3"
            />
          </div>
          <div className="text-xs text-muted-foreground">Recommended minimum dimensions: 800 × 600 pixels</div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
