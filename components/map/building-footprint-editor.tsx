"use client"

import { useEffect } from "react"
import { useMapEditor } from "@/context/map-editor-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react"

export function BuildingFootprintEditor() {
  const { mapSettings, updateMapSettings, isEditingFootprint } = useMapEditor()
  const { buildingWidth, buildingHeight, buildingX, buildingY, gridSize } = mapSettings

  useEffect(() => {
    // Clean up any event listeners when component unmounts
    return () => {
      // Cleanup
    }
  }, [])

  if (!isEditingFootprint) return null

  // Handle input change
  const handleInputChange = (property: string, value: string) => {
    const numValue = Number.parseInt(value, 10)
    if (isNaN(numValue)) return

    const updates: any = {}
    updates[property] = numValue

    // Apply minimum constraints
    if (property === "buildingWidth" && numValue < gridSize * 5) {
      updates[property] = gridSize * 5
    }
    if (property === "buildingHeight" && numValue < gridSize * 5) {
      updates[property] = gridSize * 5
    }

    // Keep within map bounds
    if (property === "buildingX") {
      updates[property] = Math.max(0, Math.min(numValue, mapSettings.width - buildingWidth))
    }
    if (property === "buildingY") {
      updates[property] = Math.max(0, Math.min(numValue, mapSettings.height - buildingHeight))
    }

    updateMapSettings(updates)
  }

  // Move building by grid size
  const moveBuilding = (direction: "left" | "right" | "up" | "down") => {
    let newX = buildingX
    let newY = buildingY

    switch (direction) {
      case "left":
        newX = Math.max(0, buildingX - gridSize)
        break
      case "right":
        newX = Math.min(mapSettings.width - buildingWidth, buildingX + gridSize)
        break
      case "up":
        newY = Math.max(0, buildingY - gridSize)
        break
      case "down":
        newY = Math.min(mapSettings.height - buildingHeight, buildingY + gridSize)
        break
    }

    updateMapSettings({
      buildingX: newX,
      buildingY: newY,
    })
  }

  // Resize building by grid size
  const resizeBuilding = (dimension: "width" | "height", increase: boolean) => {
    const change = increase ? gridSize : -gridSize

    if (dimension === "width") {
      const newWidth = Math.max(gridSize * 5, Math.min(mapSettings.width - buildingX, buildingWidth + change))
      updateMapSettings({ buildingWidth: newWidth })
    } else {
      const newHeight = Math.max(gridSize * 5, Math.min(mapSettings.height - buildingY, buildingHeight + change))
      updateMapSettings({ buildingHeight: newHeight })
    }
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => resizeBuilding("width", false)}
                  disabled={buildingWidth <= gridSize * 5}
                >
                  -
                </Button>
                <Input
                  id="building-width"
                  type="number"
                  value={buildingWidth}
                  onChange={(e) => handleInputChange("buildingWidth", e.target.value)}
                  min={gridSize * 5}
                  step={gridSize}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => resizeBuilding("width", true)}
                  disabled={buildingWidth >= mapSettings.width - buildingX}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="building-height">Height (px)</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => resizeBuilding("height", false)}
                  disabled={buildingHeight <= gridSize * 5}
                >
                  -
                </Button>
                <Input
                  id="building-height"
                  type="number"
                  value={buildingHeight}
                  onChange={(e) => handleInputChange("buildingHeight", e.target.value)}
                  min={gridSize * 5}
                  step={gridSize}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => resizeBuilding("height", true)}
                  disabled={buildingHeight >= mapSettings.height - buildingY}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building-x">X Position</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => moveBuilding("left")} disabled={buildingX <= 0}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Input
                  id="building-x"
                  type="number"
                  value={buildingX}
                  onChange={(e) => handleInputChange("buildingX", e.target.value)}
                  min={0}
                  max={mapSettings.width - buildingWidth}
                  step={gridSize}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveBuilding("right")}
                  disabled={buildingX >= mapSettings.width - buildingWidth}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="building-y">Y Position</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => moveBuilding("up")} disabled={buildingY <= 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Input
                  id="building-y"
                  type="number"
                  value={buildingY}
                  onChange={(e) => handleInputChange("buildingY", e.target.value)}
                  min={0}
                  max={mapSettings.height - buildingHeight}
                  step={gridSize}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveBuilding("down")}
                  disabled={buildingY >= mapSettings.height - buildingHeight}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-2">All values snap to the grid size ({gridSize}px)</div>
        </CardContent>
      </Card>
    </div>
  )
}
