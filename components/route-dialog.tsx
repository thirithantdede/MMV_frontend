"use client"

import { useState, useMemo, useCallback } from "react"
import { X, AlertCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { findPath } from "@/utils/pathfinding"
import { useMapEditor } from "@/context/map-editor-context"
import { SearchInput } from "@/components/ui/search-input"
import { ElementList } from "@/components/ui/element-list"
import type { MapElement } from "@/types"
import { ElementIcon } from "./map/element-icon"


interface RouteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  elements: MapElement[]
  onRouteSelect: (source: MapElement | null, target: MapElement | null, path: any[]) => void
  isGuestMode?: boolean
}

export function RouteDialog({ open, onOpenChange, elements, onRouteSelect, isGuestMode = false }: RouteDialogProps) {
  const [sourceSearch, setSourceSearch] = useState("")
  const [targetSearch, setTargetSearch] = useState("")
  const [selectedSource, setSelectedSource] = useState<MapElement | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<MapElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>("all")
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all")
  const { mapSettings } = useMapEditor()

  // Get all routable elements (not just stores)
  const routeableElements = useMemo(() => {
    // Filter out elements that shouldn't be routable
    return elements.filter((element) => !["pathway", "floor"].includes(element.type))
  }, [elements])

  // Get unique element types for filter dropdown
  const elementTypes = useMemo(() => {
    const types = new Set<string>()
    routeableElements.forEach((element) => {
      types.add(element.type)
    })
    return Array.from(types)
  }, [routeableElements])

  // Filter elements based on search and type filter
  const filteredSourceElements = useMemo(() => {
    let filtered = routeableElements

    // Apply type filter
    if (sourceTypeFilter !== "all") {
      filtered = filtered.filter((element) => element.type === sourceTypeFilter)
    }

    // Apply search filter
    if (sourceSearch.trim()) {
      const searchLower = sourceSearch.toLowerCase()
      filtered = filtered.filter((element) => element.name.toLowerCase().includes(searchLower))
    }

    return filtered
  }, [routeableElements, sourceTypeFilter, sourceSearch])

  const filteredTargetElements = useMemo(() => {
    let filtered = routeableElements

    // Apply type filter
    if (targetTypeFilter !== "all") {
      filtered = filtered.filter((element) => element.type === targetTypeFilter)
    }

    // Apply search filter
    if (targetSearch.trim()) {
      const searchLower = targetSearch.toLowerCase()
      filtered = filtered.filter((element) => element.name.toLowerCase().includes(searchLower))
    }

    return filtered
  }, [routeableElements, targetTypeFilter, targetSearch])

  // Update the handleFindRoute function to be more explicit
  const handleFindRoute = useCallback(() => {
    if (!selectedSource || !selectedTarget) return

    // Check if source and destination are the same
    if (selectedSource.id === selectedTarget.id) {
      setError("Source and destination cannot be the same")
      return
    }

    setError(null)

    // Calculate path immediately using our pathfinding utility
    const path = findPath(selectedSource, selectedTarget, elements, mapSettings, isGuestMode)

    // Pass the calculated path to the parent component
    onRouteSelect(selectedSource, selectedTarget, path)

    // Close the dialog
    onOpenChange(false)
  }, [selectedSource, selectedTarget, elements, mapSettings, onRouteSelect, onOpenChange, isGuestMode])

  const handleSelectSource = useCallback(
    (element: MapElement) => {
      setSelectedSource(element)
      // Clear error when selection changes
      setError(null)

      // If the selected target is the same as this source, clear the target
      if (selectedTarget && selectedTarget.id === element.id) {
        setSelectedTarget(null)
      }
    },
    [selectedTarget],
  )

  const handleSelectTarget = useCallback(
    (element: MapElement) => {
      setSelectedTarget(element)
      // Clear error when selection changes
      setError(null)

      // If the selected source is the same as this target, clear the source
      if (selectedSource && selectedSource.id === element.id) {
        setSelectedSource(null)
      }
    },
    [selectedSource],
  )

  const renderSelectedElement = (element: MapElement | null) => {
    if (!element) return null

    return (
      <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md text-sm mb-2">
        <ElementIcon type={element.type} className="h-4 w-4" />
        <span>{element.name}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {element.type.charAt(0).toUpperCase() + element.type.slice(1)} • Floor {element.floor}
        </span>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Find Route</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="source-element">Starting Point</Label>
            <div className="flex items-center gap-2 mb-2">
              <SearchInput
                value={sourceSearch}
                onChange={setSourceSearch}
                placeholder="Search elements..."
                onClear={() => setSourceSearch("")}
                className="flex-1"
              />
              <Select value={sourceTypeFilter} onValueChange={setSourceTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {elementTypes.map((type) => (
                    <SelectItem key={`source-${type}`} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {renderSelectedElement(selectedSource)}

            <ElementList
              elements={filteredSourceElements}
              onElementClick={handleSelectSource}
              selectedElementId={selectedSource?.id}
              disabledElementId={selectedTarget?.id}
              maxHeight="120px"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-element">Destination</Label>
            <div className="flex items-center gap-2 mb-2">
              <SearchInput
                value={targetSearch}
                onChange={setTargetSearch}
                placeholder="Search elements..."
                onClear={() => setTargetSearch("")}
                className="flex-1"
              />
              <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {elementTypes.map((type) => (
                    <SelectItem key={`target-${type}`} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {renderSelectedElement(selectedTarget)}

            <ElementList
              elements={filteredTargetElements}
              onElementClick={handleSelectTarget}
              selectedElementId={selectedTarget?.id}
              disabledElementId={selectedSource?.id}
              maxHeight="120px"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleFindRoute} disabled={!selectedSource || !selectedTarget}>
            Find Route
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
