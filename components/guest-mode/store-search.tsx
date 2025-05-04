"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMapEditor } from "@/context/map-editor-context"
import { SearchInput } from "@/components/ui/search-input"
import { ElementList } from "@/components/ui/element-list"
import type { MapElement } from "@/types"

interface ElementSearchProps {
  onElementSelect: (element: MapElement) => void
}

export function ElementSearch({ onElementSelect }: ElementSearchProps) {
  const { elements } = useMapEditor()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null)
  const [showElementDetails, setShowElementDetails] = useState(false)
  const [typeFilter, setTypeFilter] = useState("all")

  // Get unique element types for filter dropdown
  const elementTypes = useMemo(() => {
    const types = new Set<string>()
    elements.forEach((element) => {
      types.add(element.type)
    })
    return Array.from(types)
  }, [elements])

  // Filter elements based on search query and type filter
  const filteredElements = useMemo(() => {
    if (!searchQuery.trim() && typeFilter === "all") return []

    let filtered = elements

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((element) => element.type === typeFilter)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter((element) => element.name.toLowerCase().includes(searchLower))
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [elements, searchQuery, typeFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() || typeFilter !== "all") {
      setShowSearchResults(true)
    }
  }

  const handleElementClick = (element: MapElement) => {
    setSelectedElement(element)
    setShowElementDetails(true)
  }

  const handleFindOnMap = () => {
    if (selectedElement) {
      onElementSelect(selectedElement)
      setShowElementDetails(false)
      setShowSearchResults(false)
      setSearchQuery("")
      setTypeFilter("all")
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setTypeFilter("all")
  }

  return (
    <>
      <form onSubmit={handleSearch} className="relative">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search elements..."
          onClear={clearSearch}
          className="w-full"
        />
        <div className="absolute right-10 top-1">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-7 w-[100px] text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {elementTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>

      {/* Search Results Dialog */}
      <Dialog open={showSearchResults} onOpenChange={setShowSearchResults}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
          </DialogHeader>

          <ElementList
            elements={filteredElements}
            onElementClick={handleElementClick}
            emptyMessage={
              searchQuery ? `No elements found matching "${searchQuery}"` : "Enter a search term to find elements"
            }
            maxHeight="300px"
          />
        </DialogContent>
      </Dialog>

      {/* Element Details Dialog */}
      {selectedElement && (
        <Dialog open={showElementDetails} onOpenChange={setShowElementDetails}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedElement.name}</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium">Floor {selectedElement.floor}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {selectedElement.type}
                  {selectedElement.category && ` • ${selectedElement.category}`}
                </div>
              </div>

              {selectedElement.type === "store" && selectedElement.openHours && (
                <div className="mb-4">
                  <p className="text-sm font-medium">Opening Hours:</p>
                  <p className="text-sm">{selectedElement.openHours}</p>
                </div>
              )}

              {selectedElement.type === "store" &&
                selectedElement.closedDay &&
                selectedElement.closedDay !== "none" && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Closed on:</p>
                    <p className="text-sm capitalize">{selectedElement.closedDay}</p>
                  </div>
                )}

              {selectedElement.notes && (
                <div className="bg-muted/30 p-4 rounded-md mb-4">
                  <p className="text-sm font-medium">Description:</p>
                  <p className="text-sm whitespace-pre-line">{selectedElement.notes}</p>
                </div>
              )}

              {selectedElement.type === "store" && selectedElement.hasPromotion && selectedElement.promotionDetails && (
                <div className="bg-primary/10 p-4 rounded-md mb-4">
                  <p className="text-sm font-medium">Current Promotion:</p>
                  <p className="text-sm whitespace-pre-line">{selectedElement.promotionDetails}</p>
                  {selectedElement.promotionEndDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Ends: {new Date(selectedElement.promotionEndDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button onClick={handleFindOnMap}>Find on Map</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
