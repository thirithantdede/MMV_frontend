"use client"

import { useEffect, useState } from "react"
import { useMapEditor } from "@/context/map-editor-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react"

export function BuildingFootprintEditor() {
  const { mapSettings, updateMapSettings, isEditingFootprint } = useMapEditor()
  const { building_width, building_height, building_x, building_y, grid_size } = mapSettings

  const [localWidth, setLocalWidth] = useState(building_width)
  const [localHeight, setLocalHeight] = useState(building_height)
  const [localX, setLocalX] = useState(building_x)
  const [localY, setLocalY] = useState(building_y)

  useEffect(() => {
    setLocalWidth(building_width)
    setLocalHeight(building_height)
    setLocalX(building_x)
    setLocalY(building_y)
  }, [building_width, building_height, building_x, building_y])

  if (!isEditingFootprint) return null

  const handleSave = () => {
    const updates: any = {}

    updates.building_width = Math.max(grid_size * 5, Math.min(mapSettings.width - localX, localWidth))
    updates.building_height = Math.max(grid_size * 5, Math.min(mapSettings.height - localY, localHeight))
    updates.building_x = Math.max(0, Math.min(mapSettings.width - updates.building_width, localX))
    updates.building_y = Math.max(0, Math.min(mapSettings.height - updates.building_height, localY))

    // dont't let more than 10000px
    updates.building_width = Math.min(10000, updates.building_width)
    updates.building_height = Math.min(10000, updates.building_height)
    updates.building_x = Math.min(10000, updates.building_x)
    updates.building_y = Math.min(10000, updates.building_y)

    updateMapSettings(updates)
  }

  const handleInputChange = (setter: Function) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(Number(e.target.value))
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 select-none">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-lg">Building Footprint Editor</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building-width">Width (px)</Label>
              <Input
                id="building-width"
                type="number"
                value={localWidth}
                min={grid_size * 5}
                step={grid_size}
                onChange={handleInputChange(setLocalWidth)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="building-height">Height (px)</Label>
              <Input
                id="building-height"
                type="number"
                value={localHeight}
                min={grid_size * 5}
                step={grid_size}
                onChange={handleInputChange(setLocalHeight)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building-x">X Position</Label>
              <Input
                id="building-x"
                type="number"
                value={localX}
                min={0}
                step={grid_size}
                onChange={handleInputChange(setLocalX)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="building-y">Y Position</Label>
              <Input
                id="building-y"
                type="number"
                value={localY}
                min={0}
                step={grid_size}
                onChange={handleInputChange(setLocalY)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save</Button>
          </div>

          <div className="text-xs text-muted-foreground mt-2">All values snap to the grid size ({grid_size}px)</div>
        </CardContent>
      </Card>
    </div>
  )
}
