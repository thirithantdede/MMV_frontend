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
  const { buildingWidth, buildingHeight, buildingX, buildingY, gridSize } = mapSettings

  const [localWidth, setLocalWidth] = useState(buildingWidth)
  const [localHeight, setLocalHeight] = useState(buildingHeight)
  const [localX, setLocalX] = useState(buildingX)
  const [localY, setLocalY] = useState(buildingY)

  useEffect(() => {
    setLocalWidth(buildingWidth)
    setLocalHeight(buildingHeight)
    setLocalX(buildingX)
    setLocalY(buildingY)
  }, [buildingWidth, buildingHeight, buildingX, buildingY])

  if (!isEditingFootprint) return null

  const handleSave = () => {
    const updates: any = {}

    updates.buildingWidth = Math.max(gridSize * 5, Math.min(mapSettings.width - localX, localWidth))
    updates.buildingHeight = Math.max(gridSize * 5, Math.min(mapSettings.height - localY, localHeight))
    updates.buildingX = Math.max(0, Math.min(mapSettings.width - updates.buildingWidth, localX))
    updates.buildingY = Math.max(0, Math.min(mapSettings.height - updates.buildingHeight, localY))

    // dont't let more than 10000px
    updates.buildingWidth = Math.min(10000, updates.buildingWidth)
    updates.buildingHeight = Math.min(10000, updates.buildingHeight)
    updates.buildingX = Math.min(10000, updates.buildingX)
    updates.buildingY = Math.min(10000, updates.buildingY)

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
                min={gridSize * 5}
                step={gridSize}
                onChange={handleInputChange(setLocalWidth)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="building-height">Height (px)</Label>
              <Input
                id="building-height"
                type="number"
                value={localHeight}
                min={gridSize * 5}
                step={gridSize}
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
                step={gridSize}
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
                step={gridSize}
                onChange={handleInputChange(setLocalY)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save</Button>
          </div>

          <div className="text-xs text-muted-foreground mt-2">All values snap to the grid size ({gridSize}px)</div>
        </CardContent>
      </Card>
    </div>
  )
}
