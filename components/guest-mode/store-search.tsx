"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMapEditor } from "@/context/map-editor-context"
import { SearchInput } from "@/components/ui/search-input"
import { ElementList } from "@/components/ui/element-list"
import type { MapElement } from "@/types"
import useQuery from "@/hooks/use-query"
import { AlertCircle, Ticket } from "lucide-react"

interface ElementSearchProps {
  onElementSelect: (element: MapElement) => void
}

interface QueryErrorInterface {
  status: number
  data: any
}

export function ElementSearch({ onElementSelect }: ElementSearchProps) {
  const { project } = useMapEditor()
  const [searchQuery, setSearchQuery] = useState(" ")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null)
  const [showElementDetails, setShowElementDetails] = useState(false)
  const [typeFilter, setTypeFilter] = useState("all")

  const dataFetching = useQuery(`/search-elements/${project.id}?search=${searchQuery}`)

  // Refetch when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() && dataFetching?.refetch) {
      dataFetching.refetch()
    }
  }, [searchQuery, dataFetching?.refetch])

  // Ensure elements is always an array
  const elements = useMemo(() => {
    if (!dataFetching?.data) return []
    if (Array.isArray(dataFetching.data)) {
      return dataFetching.data as MapElement[]
    } else if (dataFetching.data && typeof dataFetching.data === "object" && Array.isArray(dataFetching.data.elements)) {
      return dataFetching.data.elements as MapElement[]
    }
    console.warn("Unexpected data format for search elements:", dataFetching.data)
    return []
  }, [dataFetching?.data])

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

  // Error UI for 404 or other errors
  if (dataFetching.error) {
    const error = dataFetching.error as QueryErrorInterface
    return (
      <div className="p-4 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-red-600">
            {error.status === 404 ? "Project Not Found" : "Error Loading Elements"}
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            {error.status === 404
              ? `The project with ID "${project.id}" could not be found. Please check the project ID or try again.`
              : `An error occurred: ${error.data?.message || "Please try again."}`}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 text-sm bg-red-50/50 rounded-xl p-4 border border-red-200/50 mb-4">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <span className="text-red-600 font-medium">
            Error: {error.status === 404 ? "Project not found" : "Failed to load elements"}
          </span>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={() => dataFetching.refetch()} className="bg-primary hover:bg-primary/90">
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="border-slate-300"
          >
            Back to Home
          </Button>
        </div>
      </div>
    )
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
          {/* Uncomment if Select component is needed */}
          {/* <Select value={typeFilter} onValueChange={setTypeFilter}>
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
          </Select> */}
        </div>
      </form>

      {/* Search Results Dialog */}
      <Dialog open={showSearchResults} onOpenChange={setShowSearchResults}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
          </DialogHeader>

          {dataFetching?.isLoading ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="p-4 bg-muted/30 rounded-full mb-4">
                <Ticket className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Loading Search Results</h3>
              <p className="text-muted-foreground max-w-sm">
                Please wait while we fetch the elements...
              </p>
            </div>
          ) : (
            <ElementList
              elements={filteredElements}
              onElementClick={handleElementClick}
              emptyMessage={
                searchQuery
                  ? `No elements found matching "${searchQuery}"`
                  : "Enter a search term to find elements"
              }
              maxHeight="300px"
            />
          )}
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
                  {selectedElement.shop_information?.store_category_id &&
                    ` • ${selectedElement.shop_information?.store_category_id}`}
                </div>
              </div>

              {selectedElement.type === "store" && selectedElement.shop_information?.opening_hours && (
                <div className="mb-4">
                  <p className="text-sm font-medium">Opening Hours:</p>
                  <p className="text-sm">
                    {selectedElement.shop_information?.opening_hours?.start} -{" "}
                    {selectedElement.shop_information?.opening_hours?.end}
                  </p>
                </div>
              )}

              {selectedElement.type === "store" &&
                selectedElement.shop_information?.closed_days &&
                selectedElement.shop_information?.closed_days !== "none" && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">Closed on:</p>
                    <p className="text-sm capitalize">{selectedElement.shop_information?.closed_days}</p>
                  </div>
                )}

              {selectedElement.notes && (
                <div className="bg-muted/30 p-4 rounded-md mb-4">
                  <p className="text-sm font-medium">Description:</p>
                  <p className="text-sm whitespace-pre-line">{selectedElement.notes}</p>
                </div>
              )}

              {selectedElement.type === "store" &&
                selectedElement.shop_information?.promotions.is_now &&
                selectedElement.shop_information?.promotions.detail && (
                  <div className="bg-primary/10 p-4 rounded-md mb-4">
                    <p className="text-sm font-medium">Current Promotion:</p>
                    <p className="text-sm whitespace-pre-line">
                      {selectedElement.shop_information?.promotions?.detail}
                    </p>
                    {selectedElement.shop_information?.promotions.end_date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Ends:{" "}
                        {new Date(
                          selectedElement?.shop_information?.promotions?.end_date
                        ).toLocaleDateString()}
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