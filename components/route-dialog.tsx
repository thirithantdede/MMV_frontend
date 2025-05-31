"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { AlertCircle, Filter, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { findPath } from "@/utils/pathfinding"
import { useMapEditor } from "@/context/map-editor-context"
import { SearchInput } from "@/components/ui/search-input"
import { ElementList } from "@/components/ui/element-list"
import { ElementIcon } from "./map/element-icon"
import useQuery from "@/hooks/use-query"
import type { MapElement } from "@/types"

interface RouteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  elements: MapElement[]
  onRouteSelect: (source: MapElement | null, target: MapElement | null, path: any[]) => void
  isGuestMode?: boolean
}

interface QueryError {
  status: number
  data: any
}

export function RouteDialog({ open, onOpenChange, elements, onRouteSelect, isGuestMode = false }: RouteDialogProps) {
  const [sourceSearch, setSourceSearch] = useState("")
  const [targetSearch, setTargetSearch] = useState("")
  const [selectedSource, setSelectedSource] = useState<MapElement | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<MapElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { mapSettings, project, floors, currentFloor,floorElements} = useMapEditor()
  
  // Initialize filters with current floor as default
  const [sourceTypeFilter, setSourceTypeFilter] = useState(currentFloor.toString())
  const [targetTypeFilter, setTargetTypeFilter] = useState(currentFloor.toString())

  // Reset filters to current floor when dialog opens
  useEffect(() => {
    if (open) {
      setSourceTypeFilter(currentFloor.toString())
      setTargetTypeFilter(currentFloor.toString())
      setSourceSearch("")
      setTargetSearch("")
      setSelectedSource(null)
      setSelectedTarget(null)
      setError(null)
    }
  }, [open, currentFloor])

  // Build search query with floor filter
  const buildSearchQuery = (search: string, floorFilter: string) => {
    const params = new URLSearchParams()
    if (search.trim()) {
      params.append('search', search.trim())
    }
    if (floorFilter !== "all") {
      params.append('floor', floorFilter)
    }
    return params.toString()
  }

  const sourceQueryString = buildSearchQuery(sourceSearch, sourceTypeFilter)
  const targetQueryString = buildSearchQuery(targetSearch, targetTypeFilter)

  const sourceQuery = useQuery(`/search-elements/${project.id}?${sourceQueryString}`)
  const targetQuery = useQuery(`/search-elements/${project.id}?${targetQueryString}`)

  // Refetch when search or filter changes
  useEffect(() => {
    if (sourceQuery.refetch) {
      sourceQuery.refetch()
    }
  }, [sourceSearch, sourceTypeFilter])

  useEffect(() => {
    if (targetQuery.refetch) {
      targetQuery.refetch()
    }
  }, [targetSearch, targetTypeFilter])

  const parseElements = (data: any): MapElement[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (Array.isArray(data.elements)) return data.elements
    console.warn("Unexpected data format:", data)
    return []
  }

  const sourceElements = useMemo(() => parseElements(sourceQuery.data), [sourceQuery.data])
  const targetElements = useMemo(() => parseElements(targetQuery.data), [targetQuery.data])

  // Filter out non-navigable elements
  const filterNavigableElements = (elems: MapElement[]) =>
    elems.filter(e => !["pathway", "floor"].includes(e.type))

  const filteredSourceElements = useMemo(() => 
    filterNavigableElements(sourceElements), 
    [sourceElements]
  )
  
  const filteredTargetElements = useMemo(() => 
    filterNavigableElements(targetElements), 
    [targetElements]
  )

  // Show all elements when no search query and "all" floors selected
  const shouldShowAllElements = (search: string, filter: string) => 
    !search.trim() && filter === "all"

  // Get all elements for the current context when no search is performed
  const getAllElementsForFilter = (filter: string) => {
    const allElements = elements.filter(e => !["pathway", "floor"].includes(e.type))
    if (filter === "all") return allElements
    return allElements.filter(e => e.floor.toString() === filter)
  }

  // Final elements to display
  const finalSourceElements = useMemo(() => {
    if (shouldShowAllElements(sourceSearch, sourceTypeFilter)) {
      return getAllElementsForFilter(sourceTypeFilter)
    }
    return filteredSourceElements
  }, [sourceSearch, sourceTypeFilter, filteredSourceElements, elements])

  const finalTargetElements = useMemo(() => {
    if (shouldShowAllElements(targetSearch, targetTypeFilter)) {
      return getAllElementsForFilter(targetTypeFilter)
    }
    return filteredTargetElements
  }, [targetSearch, targetTypeFilter, filteredTargetElements, elements])

  const handleFindRoute = useCallback(() => {
    if (!selectedSource || !selectedTarget) return
    if (selectedSource.id === selectedTarget.id) {
      setError("Source and destination cannot be the same")
      return
    }
    const path = findPath(selectedSource, selectedTarget, elements,floorElements, mapSettings, isGuestMode)
    onRouteSelect(selectedSource, selectedTarget, path)
    onOpenChange(false)
  }, [selectedSource, selectedTarget, elements, mapSettings, isGuestMode, onRouteSelect, onOpenChange])

  const handleSelectSource = useCallback((element: MapElement) => {
    setSelectedSource(element)
    setError(null)
    if (selectedTarget?.id === element.id) setSelectedTarget(null)
  }, [selectedTarget])

  const handleSelectTarget = useCallback((element: MapElement) => {
    setSelectedTarget(element)
    setError(null)
    if (selectedSource?.id === element.id) setSelectedSource(null)
  }, [selectedSource])

  const renderSelectedElement = (element: MapElement | null) => element && (
    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-sm mb-2">
      <ElementIcon type={element.type} className="h-4 w-4" />
      <span>{element.name}</span>
      <span className="text-xs text-muted-foreground ml-auto">
        {element.type.charAt(0).toUpperCase() + element.type.slice(1)} • Floor {element.floor}
      </span>
    </div>
  )

  const isLoading = (search: string, query: any) => {
    return search.trim() && query.isLoading
  }

  if (sourceQuery.error || targetQuery.error) {
    const err = (sourceQuery.error || targetQuery.error) as QueryError
    return (
      <div className="p-4 bg-white/80 border border-white/20 shadow-xl rounded-3xl">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-red-600">
            {err.status === 404 ? "Project Not Found" : "Error Loading Elements"}
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            {err.status === 404
              ? `Project ID "${project.id}" not found. Check ID or retry.`
              : `Error: ${err.data?.message || "Please try again."}`}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 bg-red-50/50 rounded-xl p-3 border border-red-200/50 mb-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-600 text-sm font-medium">
            {err.status === 404 ? "Project not found" : "Failed to load elements"}
          </span>
        </div>
        <div className="flex justify-center gap-3">
          <Button 
            onClick={() => {
              if (sourceQuery.error) sourceQuery.refetch()
              if (targetQuery.error) targetQuery.refetch()
            }} 
            className="bg-primary"
          >
            Retry
          </Button>
          <Button variant="outline" onClick={() => location.href = "/"}>
            Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Find Route</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>Starting Point</Label>
            <div className="flex gap-2 mb-2">
              <SearchInput
                value={sourceSearch}
                onChange={setSourceSearch}
                placeholder="Search start..."
                onClear={() => setSourceSearch("")}
                className="flex-1"
              />
              <Select value={sourceTypeFilter} onValueChange={setSourceTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.values(floors)?.map(floor => (
                    <SelectItem key={`source-floor-${floor.id}`} value={floor.level.toString()}>
                      Floor {floor.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {renderSelectedElement(selectedSource)}
            {isLoading(sourceSearch, sourceQuery) ? (
              <div className="flex flex-col items-center justify-center h-[120px] text-center">
                <div className="p-2 bg-muted rounded-full mb-2">
                  <Ticket className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <ElementList
                elements={finalSourceElements}
                onElementClick={handleSelectSource}
                selectedElementId={selectedSource?.id}
                disabledElementId={selectedTarget?.id}
                maxHeight="120px"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Destination</Label>
            <div className="flex gap-2 mb-2">
              <SearchInput
                value={targetSearch}
                onChange={setTargetSearch}
                placeholder="Search destination..."
                onClear={() => setTargetSearch("")}
                className="flex-1"
              />
              <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.values(floors)?.map(floor => (
                    <SelectItem key={`target-floor-${floor.id}`} value={floor.level.toString()}>
                      Floor {floor.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {renderSelectedElement(selectedTarget)}
            {isLoading(targetSearch, targetQuery) ? (
              <div className="flex flex-col items-center justify-center h-[120px] text-center">
                <div className="p-2 bg-muted rounded-full mb-2">
                  <Ticket className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <ElementList
                elements={finalTargetElements}
                onElementClick={handleSelectTarget}
                selectedElementId={selectedTarget?.id}
                disabledElementId={selectedSource?.id}
                maxHeight="120px"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleFindRoute} disabled={!selectedSource || !selectedTarget}>
            Find Route
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}