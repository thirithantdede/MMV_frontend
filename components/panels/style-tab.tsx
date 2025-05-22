import { borderRadius, MapElement } from "@/types"
import { memo, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "../ui/separator"
import { RotateCw } from "lucide-react"
import { Slider } from "../ui/slider"

const getBorderRadiusEntries = (border_radius:borderRadius) => {
  return {
    "Top Right": {
        "label" : "border_radius.topRight",
        "value" : border_radius?.topRight
    },
    "Top Left": {
        "label" : "border_radius.topLeft",
        "value" : border_radius?.topLeft 
    } ,
    "Bottom Right": {
        "label" : "border_radius.bottomRight",
        "value" : border_radius?.bottomRight
    },
    "Bottom Left": {
        "label" : "border_radius.bottomLeft",
        "value" : border_radius?.bottomLeft 
    } 
   
  }
}

const StyleProperties = memo(function StyleProperties({
  element,
  onPropertyChange,
}: {
  element: MapElement
  onPropertyChange: (property: string, value: any) => void
}) {
  const borderStyles = useMemo(
    () => [
      { value: "none", label: "None" },
      { value: "solid", label: "Solid" },
      { value: "dashed", label: "Dashed" },
      { value: "dotted", label: "Dotted" },
    ],
    [],
  )

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("color", e.target.value),
    [onPropertyChange],
  )

  const handleOpacityChange = useCallback(
    (value: number[]) => onPropertyChange("opacity", value[0]),
    [onPropertyChange],
  )

  const handleBorderStyleChange = useCallback(
    (value: string) => onPropertyChange("borderStyle", value),
    [onPropertyChange],
  )

  const handleBorderRadiusChange = useCallback(
    (key: string, value: number) => {
      onPropertyChange("borderRadius", {
        ...element.border_radius,
        [key]: value,
      })
    },
    [onPropertyChange, element.border_radius],
  )

  const handleRotationChange = useCallback(
    (value: number[]) => onPropertyChange("rotation", value[0]),
    [onPropertyChange],
  )

  const rotateElement = useCallback(() => {
    const currentRotation = element.rotation || 0
    const newRotation = (currentRotation + 90) % 360
    onPropertyChange("rotation", newRotation)
  }, [element.rotation, onPropertyChange])

  const resetRotation = useCallback(() => {
    onPropertyChange("rotation", 0)
  }, [onPropertyChange])

  const handleRadiusChange = useCallback(
    (cornerKey: keyof borderRadius, value: number) => {
      const newRadius: borderRadius = {
        ...element.border_radius,
        [cornerKey]: value,
      }
      onPropertyChange("border_radius", newRadius)
    },
    [element.border_radius, onPropertyChange]
  )
  

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="element-color">Background Color</Label>
        <div className="flex gap-2">
          <Input
            id="element-color"
            type="color"
            value={element.color || "#e2e8f0"}
            onChange={handleColorChange}
            className="w-12"
          />
          <Input value={element.color || "#e2e8f0"} onChange={handleColorChange} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-opacity">Opacity</Label>
        <div className="flex items-center gap-4">
          <Slider
            id="element-opacity"
            value={[element.opacity || 100]}
            max={100}
            step={1}
            className="flex-1"
            onValueChange={handleOpacityChange}
          />
          <span className="w-12 text-right">{element.opacity || 100}%</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="element-border">Border Style</Label>
        <Select value={element.border_style || "solid"} onValueChange={handleBorderStyleChange}>
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
        {Object.entries(getBorderRadiusEntries(element?.border_radius)).map(([corner,value]) => (
          <div key={corner} className="flex items-center gap-4">
            <Label className="w-24">{corner}</Label>
            <Slider
              value={[value.value]}
              max={50}
              step={5}
              className="flex-1"
              onValueChange={(val) =>
                handleRadiusChange(value.label.split(".")[1] as keyof borderRadius, val[0])
              }
            />
            <span className="w-12 text-right">{value.value}px</span>
          </div>
        ))}
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
              value={[element.rotation || 0]}
              max={360}
              step={90}
              onValueChange={handleRotationChange}
            />
          </div>
          <span className="w-12 text-right">{element.rotation || 0}°</span>
          <Button variant="secondary" size="icon" onClick={rotateElement} className="ml-1">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center mt-4">
          <div
            className="bg-muted/30 rounded-md p-4 flex items-center justify-center"
            style={{ width: "120px", height: "80px" }}
          >
            <div
              className="bg-background border-2 border-gray-300 flex items-center justify-center"
              style={{
                width: "80px",
                height: "50px",
                transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
              }}
            >
              <span className="text-xs">Preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default StyleProperties
