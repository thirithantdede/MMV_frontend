"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMapEditor } from "@/context/map-editor-context"

interface MapSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MapSettingsDialog({ open, onOpenChange }: MapSettingsDialogProps) {
  const { mapSettings, updateMapSettings } = useMapEditor()
  const [width, setWidth] = useState(mapSettings.width)
  const [height, setHeight] = useState(mapSettings.height)
  const [gridSize, setGridSize] = useState(mapSettings.gridSize)
  const [showGrid, setShowGrid] = useState(mapSettings.showGrid)

  // Building footprint settings
  const [buildingWidth, setBuildingWidth] = useState(mapSettings.buildingWidth)
  const [buildingHeight, setBuildingHeight] = useState(mapSettings.buildingHeight)
  const [buildingX, setBuildingX] = useState(mapSettings.buildingX)
  const [buildingY, setBuildingY] = useState(mapSettings.buildingY)
  const [restrictToBuilding, setRestrictToBuilding] = useState(mapSettings.restrictToBuilding)

  // Update local state when dialog opens
  useEffect(() => {
    if (open) {
      setWidth(mapSettings.width)
      setHeight(mapSettings.height)
      setGridSize(mapSettings.gridSize)
      setShowGrid(mapSettings.showGrid)
      setBuildingWidth(mapSettings.buildingWidth)
      setBuildingHeight(mapSettings.buildingHeight)
      setBuildingX(mapSettings.buildingX)
      setBuildingY(mapSettings.buildingY)
      setRestrictToBuilding(mapSettings.restrictToBuilding)
    }
  }, [open, mapSettings])

  const handleSave = () => {
    // Ensure minimum dimensions
    const finalWidth = Math.max(width, 800)
    const finalHeight = Math.max(height, 600)
    const finalGridSize = Math.max(gridSize, 5)

    // Ensure building is within map bounds
    const finalBuildingWidth = Math.min(buildingWidth, finalWidth - buildingX)
    const finalBuildingHeight = Math.min(buildingHeight, finalHeight - buildingY)

    updateMapSettings({
      width: finalWidth,
      height: finalHeight,
      gridSize: finalGridSize,
      showGrid,
      buildingWidth: finalBuildingWidth,
      buildingHeight: finalBuildingHeight,
      buildingX,
      buildingY,
      restrictToBuilding,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Map Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="map">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Map Canvas</TabsTrigger>
            <TabsTrigger value="building">Building Footprint</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4 py-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grid-size" className="col-span-1">
                Grid Size
              </Label>
              <Input
                id="grid-size"
                type="number"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                min={5}
                max={50}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="show-grid" className="col-span-1">
                Show Grid
              </Label>
              <div className="col-span-3">
                <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Recommended minimum dimensions: 800 × 600 pixels</div>
          </TabsContent>

          <TabsContent value="building" className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="building-width" className="col-span-1">
                Width (px)
              </Label>
              <Input
                id="building-width"
                type="number"
                value={buildingWidth}
                onChange={(e) => setBuildingWidth(Number(e.target.value))}
                min={400}
                max={3000}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="building-height" className="col-span-1">
                Height (px)
              </Label>
              <Input
                id="building-height"
                type="number"
                value={buildingHeight}
                onChange={(e) => setBuildingHeight(Number(e.target.value))}
                min={300}
                max={2000}
                className="col-span-3"
              />
            </div>
         
            <div className="text-xs text-muted-foreground">
              The building footprint defines the area where elements can be placed
            </div>
          </TabsContent>
        </Tabs>

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
