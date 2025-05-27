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
  const [sourceTypeFilter, setSourceTypeFilter] = useState("all")
  const [targetTypeFilter, setTargetTypeFilter] = useState("all")
  const { mapSettings, project } = useMapEditor()

  const sourceQuery = useQuery(`/search-elements/${project.id}?search=${sourceSearch}`)
  const targetQuery = useQuery(`/search-elements/${project.id}?search=${targetSearch}`)

  useEffect(() => {
    if (sourceSearch.trim() && sourceQuery.refetch) sourceQuery.refetch()
  }, [sourceSearch, sourceQuery.refetch])

  useEffect(() => {
    if (targetSearch.trim() && targetQuery.refetch) targetQuery.refetch()
  }, [targetSearch, targetQuery.refetch])

  const parseElements = (data: any): MapElement[] =>
    !data ? [] :
    Array.isArray(data) ? data :
    Array.isArray(data.elements) ? data.elements :
    (console.warn("Unexpected data format:", data), [])

  const sourceElements = useMemo(() => parseElements(sourceQuery.data), [sourceQuery.data])
  const targetElements = useMemo(() => parseElements(targetQuery.data), [targetQuery.data])

  const elementTypes = useMemo(() => 
    [...new Set([...sourceElements, ...targetElements].map(e => e.type))], 
    [sourceElements, targetElements]
  )

  const filterElements = (elems: MapElement[], typeFilter: string) =>
    elems
      .filter(e => !["pathway", "floor"].includes(e.type))
      .filter(e => typeFilter === "all" || e.type === typeFilter)

  const filteredSourceElements = useMemo(() => 
    filterElements(sourceElements, sourceTypeFilter), 
    [sourceElements, sourceTypeFilter]
  )
  const filteredTargetElements = useMemo(() => 
    filterElements(targetElements, targetTypeFilter), 
    [targetElements, targetTypeFilter]
  )

  const handleFindRoute = useCallback(() => {
    if (!selectedSource || !selectedTarget) return
    if (selectedSource.id === selectedTarget.id) {
      setError("Source and destination cannot be the same")
      return
    }
    const path = findPath(selectedSource, selectedTarget, elements, mapSettings, isGuestMode)
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
                  <SelectItem value="all">All Types</SelectItem>
                  {elementTypes.map(type => (
                    <SelectItem key={`source-${type}`} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {renderSelectedElement(selectedSource)}
            {sourceQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center h-[120px] text-center">
                <div className="p-2 bg-muted rounded-full mb-2">
                  <Ticket className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <ElementList
                elements={filteredSourceElements}
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
                  <SelectItem value="all">All Types</SelectItem>
                  {elementTypes.map(type => (
                    <SelectItem key={`target-${type}`} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {renderSelectedElement(selectedTarget)}
            {targetQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center h-[120px] text-center">
                <div className="p-2 bg-muted rounded-full mb-2">
                  <Ticket className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <ElementList
                elements={filteredTargetElements}
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