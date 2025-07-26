import { MapElement } from "@/types"
import { memo, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "../ui/separator"
import { useMapEditor } from "@/context/map-editor-context"
import { Minus, Plus, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const GeneralProperties = memo(function GeneralProperties({
    element,
    onPropertyChange,
  }: {
    element: MapElement
    onPropertyChange: (property: string, value: any) => void
  }) {

    const { mapSettings } = useMapEditor();
    const { grid_size } = mapSettings;
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

    // Handle grid-based increment/decrement
    const handleGridChange = (property: 'width' | 'height', increment: boolean) => {
      const currentValue = formData[property];
      const gridValue = Math.round(currentValue / grid_size);
      const newGridValue = increment ? gridValue + 1 : Math.max(1, gridValue - 1);
      const newValue = newGridValue * grid_size;
      
      setFormData((prev) => ({
        ...prev,
        [property]: newValue,
      }))
    }
  
    const handleApply = () => {
      Object.entries(formData).forEach(([key, value ]) => {
        // check in here if intial element width and height are not divided by grid size, then divide it by grid size
        if (key == 'width' || key == 'height') {
          if (formData[key] % grid_size !== 0) {
            value = Math.round(formData[key] / grid_size) * grid_size;
          }
        }
        onPropertyChange(key, value)
      })
    }

    // Calculate real-world dimensions
    const widthInFeet = Math.round(formData.width / grid_size) * 10;
    const heightInFeet = Math.round(formData.height / grid_size) * 10;
    const areaInSqFt = widthInFeet * heightInFeet;
  
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

        {/* Grid Information Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <span className="font-medium">Grid Scale:</span> 1 grid unit = 10 square feet in real world
          </AlertDescription>
        </Alert>
  
        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="element-width">Width</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGridChange("width", false)}
                className="h-9 w-9 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="element-width"
                type="number"
                value={Math.round(formData.width / grid_size)}
                readOnly
                className="text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGridChange("width", true)}
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {widthInFeet} ft in real world
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="element-height">Height</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGridChange("height", false)}
                className="h-9 w-9 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="element-height"
                type="number"
                value={Math.round(formData.height / grid_size)}
                readOnly
                className="text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGridChange("height", true)}
                className="h-9 w-9 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {heightInFeet} ft in real world
            </p>
          </div>
        </div>

        {/* Real-world Area Display */}
        <div className="rounded-lg bg-gray-50 p-3 border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Area:</span>
            <span className="text-sm font-semibold text-gray-900">
              {areaInSqFt} sq ft
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round(formData.width / grid_size)} × {Math.round(formData.height / grid_size)} grid units
          </p>
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