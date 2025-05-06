"use client"

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react"
import type { MapElement, MapSettings } from "@/types"

interface MapEditorContextType {
  // Map elements
  elements: MapElement[]
  addElement: (element: MapElement) => void
  updateElement: (element: MapElement) => void
  removeElement: (id: string) => void

  // Selection
  selectedElement: MapElement | null
  setSelectedElement: (element: MapElement | null) => void

  // Floor management
  currentFloor: number
  totalFloors: number
  setCurrentFloor: (floor: number) => void
  addFloor: () => void

  // Map settings
  mapSettings: MapSettings
  updateMapSettings: (settings: Partial<MapSettings>) => void

  // UI state
  showLeftPanel: boolean
  showRightPanel: boolean
  toggleLeftPanel: () => void
  toggleRightPanel: () => void

  // Zoom controls
  zoomLevel: number
  setZoomLevel: (level: number) => void
  zoomIn: () => void
  zoomOut: () => void

  // Building footprint edit mode
  isEditingFootprint: boolean
  setIsEditingFootprint: (editing: boolean) => void

  // Add these new state variables to the MapEditorContextType interface
  isFloorTransitioning: boolean
  setIsFloorTransitioning: (isTransitioning: boolean) => void
}

const MapEditorContext = createContext<MapEditorContextType | undefined>(undefined)

// Helper function to load state from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue

  try {
    const storedValue = localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : defaultValue
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Helper function to save state to localStorage
const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

export function MapEditorProvider({ children }: { children: ReactNode }) {
  // Elements state - load from localStorage if available
  const [elements, setElements] = useState<MapElement[]>(() => loadFromStorage("mall-map-elements", []))

  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null)

  // Floor state
  const [currentFloor, setCurrentFloor] = useState(1)
  const [totalFloors, setTotalFloors] = useState(3)

  // Map settings - load from localStorage if available
  const [mapSettings, setMapSettings] = useState<MapSettings>(() =>
    loadFromStorage("mall-map-settings", {
      width: 3000,
      height: 2000,
      gridSize: 20,
      showGrid: true,
      // Building footprint defaults
      buildingWidth: 1600,
      buildingHeight: 1200,
      buildingX: 700,
      buildingY: 400,
      restrictToBuilding: true,
    }),
  )

  // UI state
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showRightPanel, setShowRightPanel] = useState(false)

  // Zoom state - updated min zoom to 0.3 (30%)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Building footprint edit mode
  const [isEditingFootprint, setIsEditingFootprint] = useState(false)

  // Add these new state variables to the useState declarations in the MapEditorProvider
  const [isFloorTransitioning, setIsFloorTransitioning] = useState(false)

  // Save elements to localStorage whenever they change
  useEffect(() => {
    saveToStorage("mall-map-elements", elements)
  }, [elements])

  // Save map settings to localStorage whenever they change
  useEffect(() => {
    saveToStorage("mall-map-settings", mapSettings)
  }, [mapSettings])

  // Element operations
  const addElement = useCallback((element: MapElement) => {
    setElements((prev) => [...prev, element])
  }, [])

  const updateElement = useCallback((updatedElement: MapElement) => {
    setElements((prev) => prev.map((el) => (el.id === updatedElement.id ? updatedElement : el)))
  }, [])

  const removeElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id))
    setSelectedElement((prev) => (prev?.id === id ? null : prev))
  }, [])

  // Floor operations
  // Update the handleSetCurrentFloor function to handle transitions
  const handleSetCurrentFloor = useCallback((floor: number) => {
    setCurrentFloor(floor)
    setSelectedElement(null) // Clear selection when changing floors
  }, [])

  const addFloor = useCallback(() => {
    setTotalFloors((prev) => prev + 1)
  }, [])

  // Panel toggles
  const toggleLeftPanel = useCallback(() => {
    setShowLeftPanel((prev) => !prev)
  }, [])

  const toggleRightPanel = useCallback(() => {
    setShowRightPanel((prev) => !prev)
  }, [])

  // Map settings update
  const updateMapSettings = useCallback((settings: Partial<MapSettings>) => {
    setMapSettings((prev) => ({ ...prev, ...settings }))
  }, [])

  // Zoom controls - updated min zoom to 0.3 (30%)
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 3))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.3))
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      elements,
      addElement,
      updateElement,
      removeElement,
      selectedElement,
      setSelectedElement,
      currentFloor,
      totalFloors,
      setCurrentFloor: handleSetCurrentFloor,
      addFloor,
      mapSettings,
      updateMapSettings,
      showLeftPanel,
      showRightPanel,
      toggleLeftPanel,
      toggleRightPanel,
      zoomLevel,
      setZoomLevel,
      zoomIn,
      zoomOut,
      isEditingFootprint,
      setIsEditingFootprint,
      // Add the new state variables to the contextValue object
      isFloorTransitioning,
      setIsFloorTransitioning,
    }),
    [
      elements,
      addElement,
      updateElement,
      removeElement,
      selectedElement,
      currentFloor,
      totalFloors,
      handleSetCurrentFloor,
      addFloor,
      mapSettings,
      updateMapSettings,
      showLeftPanel,
      showRightPanel,
      toggleLeftPanel,
      toggleRightPanel,
      zoomLevel,
      setZoomLevel,
      zoomIn,
      zoomOut,
      isEditingFootprint,
      setIsEditingFootprint,
      isFloorTransitioning,
      setIsFloorTransitioning,
    ],
  )

  return <MapEditorContext.Provider value={contextValue}>{children}</MapEditorContext.Provider>
}

export function useMapEditor() {
  const context = useContext(MapEditorContext)
  if (context === undefined) {
    throw new Error("useMapEditor must be used within a MapEditorProvider")
  }
  return context
}
