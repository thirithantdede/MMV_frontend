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
  const [grid_size, setgrid_size] = useState(mapSettings.grid_size)
  const [showGrid, setShowGrid] = useState(mapSettings.show_grid)
  const [showOpeningHours, setShowOpeningHours] = useState(mapSettings.show_opening_hours)

  // Building footprint settings
  const [building_width, setbuilding_width] = useState(mapSettings.building_width)
  const [building_height, setbuilding_height] = useState(mapSettings.building_height)
  const [building_x, setbuilding_x] = useState(mapSettings.building_x)
  const [building_y, setbuilding_y] = useState(mapSettings.building_y)
  const [restricted, setrestricted] = useState(mapSettings.restricted)

  // Update local state when dialog opens
  useEffect(() => {
    if (open) {
      setWidth(mapSettings.width)
      setHeight(mapSettings.height)
      setgrid_size(mapSettings.grid_size)
      setShowGrid(mapSettings.show_grid)
      setbuilding_width(mapSettings.building_width)
      setbuilding_height(mapSettings.building_height)
      setbuilding_x(mapSettings.building_x)
      setbuilding_y(mapSettings.building_y)
      setrestricted(mapSettings.restricted)
      setShowOpeningHours(mapSettings.show_opening_hours)
    }
  }, [open, mapSettings])

  const handleSave = () => {
    // Ensure minimum dimensions
    const finalWidth = Math.max(width, 800)
    const finalHeight = Math.max(height, 600)
    const finalgrid_size = Math.max(grid_size, 5)

    // Ensure building is within map bounds
    const finalbuilding_width = Math.min(building_width, finalWidth - building_x)
    const finalbuilding_height = Math.min(building_height, finalHeight - building_y)

    const bx = Math.max(0, Math.min(building_x, finalWidth - finalbuilding_width));
    const by = Math.max(0, Math.min(building_y, finalHeight - finalbuilding_height));

    updateMapSettings({
      width: finalWidth,
      height: finalHeight,
      grid_size: finalgrid_size,
      show_opening_hours: showOpeningHours,
      show_grid: showGrid,
      building_width: building_width,
      building_height: building_height,
      building_x: bx,
      building_y: by,
      restricted,
      isSynced: false
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
                value={grid_size}
                onChange={(e) => setgrid_size(Number(e.target.value))}
                min={5}
                max={50}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <Label htmlFor="show-hours">Show Open Hour</Label>
                <Switch id="show-hours" checked={showOpeningHours} onCheckedChange={setShowOpeningHours} />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="show-grid">Show Grid</Label>
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
                value={building_width}
                onChange={(e) => setbuilding_width(Number(e.target.value))}
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
                value={building_height}
                onChange={(e) => setbuilding_height(Number(e.target.value))}
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
