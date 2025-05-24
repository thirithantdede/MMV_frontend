import { MapElement } from "@/types"
import { memo, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "../ui/separator"

const GeneralProperties = memo(function GeneralProperties({
    element,
    onPropertyChange,
  }: {
    element: MapElement
    onPropertyChange: (property: string, value: any) => void
  }) {
    // Local state for inputs
    const [formData, setFormData] = useState({
      name: element.name || "",
      type: element.type || "",
      x: element.x || 0,
      y: element.y || 0,
      width: element.width || 100,
      height: element.height || 100,
    })
  
  
    // Handle input changes
    const handleChange = (key: keyof typeof formData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }))
    }
  
    const handleApply = () => {
      Object.entries(formData).forEach(([key, value]) => {
        onPropertyChange(key, value)
      })
    }
  
    return (
      <div className="space-y-4 pt-4">
        <div className="grid gap-2">
          <Label htmlFor="element-name">Name</Label>
          <Input
            id="element-name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>
  
        <Separator />
  
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="element-x">X Position</Label>
            <Input
              id="element-x"
              type="number"
              value={formData.x}
              onChange={(e) => handleChange("x", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="element-y">Y Position</Label>
            <Input
              id="element-y"
              type="number"
              value={formData.y}
              onChange={(e) => handleChange("y", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
  
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="element-width">Width</Label>
            <Input
              id="element-width"
              type="number"
              value={formData.width}
              onChange={(e) => handleChange("width", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="element-height">Height</Label>
            <Input
              id="element-height"
              type="number"
              value={formData.height}
              onChange={(e) => handleChange("height", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
  
        <div className="pt-4">
              <Button
                variant="default"
                onClick={handleApply}
                className="w-full float-right"
                >
                Apply 
                </Button>
        </div>
      </div>
    )
  })

export default GeneralProperties;