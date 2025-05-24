import { borderRadius, MapElement } from "@/types"
import { memo, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "../ui/separator"
import { RotateCw } from "lucide-react"
import { Slider } from "../ui/slider"

const getBorderRadiusEntries = (border_radius: borderRadius) => {
  return {
    "Top Right": {
      label: "topRight",
      value: border_radius?.topRight || 0,
    },
    "Top Left": {
      label: "topLeft",
      value: border_radius?.topLeft || 0,
    },
    "Bottom Right": {
      label: "bottomRight",
      value: border_radius?.bottomRight || 0,
    },
    "Bottom Left": {
      label: "bottomLeft",
      value: border_radius?.bottomLeft || 0,
    },
  }
}

const StyleProperties = memo(function StyleProperties({
  element,
  onPropertyChange,
}: {
  element: MapElement
  onPropertyChange: (property: string, value: any) => void
}) {
  const [styleData, setStyleData] = useState({
    color: element.color || "#e2e8f0",
    opacity: element.opacity || 100,
    border_style: element.border_style || "solid",
    border_radius: element.border_radius || {
      topRight: 0,
      topLeft: 0,
      bottomRight: 0,
      bottomLeft: 0,
    },
    rotation: element.rotation || 0,
  })

  const borderStyles = useMemo(
    () => [
      { value: "none", label: "None" },
      { value: "solid", label: "Solid" },
      { value: "dashed", label: "Dashed" },
      { value: "dotted", label: "Dotted" },
    ],
    [],
  )

  const handleChange = (key: keyof typeof styleData, value: any) => {
    setStyleData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleBorderRadiusChange = (
    corner: keyof borderRadius,
    value: number,
  ) => {
    setStyleData((prev) => ({
      ...prev,
      border_radius: {
        ...prev.border_radius,
        [corner]: value,
      },
    }))
  }

  const rotateElement = () => {
    setStyleData((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }))
  }

  const resetRotation = () => {
    setStyleData((prev) => ({
      ...prev,
      rotation: 0,
    }))
  }

  const handleApply = () => {
    Object.entries(styleData).forEach(([key, value]) => {
      onPropertyChange(key === "borderStyle" ? "border_style" : key, value)
    })
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="element-color">Background Color</Label>
        <div className="flex gap-2">
          <Input
            id="element-color"
            type="color"
            value={styleData.color}
            onChange={(e) => handleChange("color", e.target.value)}
            className="w-12"
          />
          <Input
            value={styleData.color}
            onChange={(e) => handleChange("color", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-opacity">Opacity</Label>
        <div className="flex items-center gap-4">
          <Slider
            id="element-opacity"
            value={[styleData.opacity]}
            max={100}
            step={1}
            className="flex-1"
            onValueChange={(val) => handleChange("opacity", val[0])}
          />
          <span className="w-12 text-right">{styleData.opacity}%</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-border">Border Style</Label>
        <Select
          value={styleData.border_style}
          onValueChange={(val) => handleChange("border_style", val)}
        >
          <SelectTrigger id="element-border">
            <SelectValue placeholder="Select border style" />
          </SelectTrigger>
          <SelectContent>
            {borderStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Corner Radius</Label>
        {Object.entries(getBorderRadiusEntries(styleData.border_radius)).map(
          ([corner, value]) => (
            <div key={corner} className="flex items-center gap-4">
              <Label className="w-24">{corner}</Label>
              <Slider
                value={[value.value]}
                max={50}
                step={5}
                className="flex-1"
                onValueChange={(val) =>
                  handleBorderRadiusChange(
                    value.label as keyof borderRadius,
                    val[0],
                  )
                }
              />
              <span className="w-12 text-right">{value.value}px</span>
            </div>
          ),
        )}
      </div>

      <Separator className="my-2" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Rotation</Label>
          <Button variant="outline" size="sm" onClick={resetRotation}>
            <RotateCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Slider
              id="element-rotation"
              value={[styleData.rotation]}
              max={360}
              step={90}
              onValueChange={(val) => handleChange("rotation", val[0])}
            />
          </div>
          <span className="w-12 text-right">{styleData.rotation}°</span>
          <Button
            variant="secondary"
            size="icon"
            onClick={rotateElement}
            className="ml-1"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="pt-4">
        <Button variant="default" onClick={handleApply} className="w-full">
          Apply
        </Button>
      </div>
    </div>
  )
})

export default StyleProperties
