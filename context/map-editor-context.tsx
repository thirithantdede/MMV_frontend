"use client"

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react"
import { FloorCollection, type MapElement, type MapSettings } from "@/types"
import useMutate from "@/hooks/use-mutate"

interface MapEditorContextType {
  // Map elements
  elements: MapElement[]
  addElement: (element: MapElement) => void
  updateElement: (element: MapElement) => void
  removeElement: (id: string) => void

  fetchFromServer : boolean,
  setFetchFromServer: (isFetchFromServer : boolean) => void
  // Selection
  selectedElement: MapElement | null
  setSelectedElement: (element: MapElement | null) => void

  // Floor management
  floors : FloorCollection | null
  updateFloors: (floors : FloorCollection) => void
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
export const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

export function MapEditorProvider({ children }: { children: ReactNode }) {
  // Elements state - load from localStorage if available
  const [currentFloor, setCurrentFloor] = useState(1)
  const [elements, setElements] = useState<MapElement[]>(() => loadFromStorage("mall-map-elements-"+currentFloor, []))
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [fetchFromServer,setFetchFromServer] = useState<boolean>(true);

  const [floors,setFloors] = useState<FloorCollection | null>(null)
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null)

  // Floor state
  const [totalFloors, setTotalFloors] = useState(2)

  // Map settings - load from localStorage if available
  const [mapSettings, setMapSettings] = useState<MapSettings>(() =>
    loadFromStorage("mall-map-settings", {
      width: 1600,
      height: 1000,
      grid_size: 20,
      showGrid: true,
      building_width: 1200,
      building_height: 800,
      building_x: 700,
      building_y: 400,
      restricted: true,
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

  const syncToServerOnSuccess = (response: any) => {
    const responseElements: MapElement[] = response?.data ?? [];
    const updated = elements.map(localEl => {
      const matched = responseElements.find(serverEl =>
        serverEl.old_element_id == localEl.id || serverEl.id == localEl.id
      );
      console.log(localEl);
  
      if (matched) {
        return {
          ...localEl,
          ...matched, // serverEl contains ulid and updated props
          id: matched.id, // ensure ID is updated if it's a new element
          isSynced: true,
        };
      }
  
      return localEl;
    });
  
    setElements(updated);
  };
  
  
  const [syncToServer, {isLoading}] = useMutate({callback:syncToServerOnSuccess});

  // Save elements to localStorage whenever they change
  useEffect(() => {
    setElements(loadFromStorage("mall-map-elements-"+currentFloor,[]))
  }, [currentFloor])

  useEffect(()=>{
    saveToStorage("mall-map-elements-"+currentFloor,elements)
  },[elements])

  // Save map settings to localStorage whenever they change
  useEffect(() => {
    saveToStorage("mall-map-settings", mapSettings)
  }, [mapSettings])

  // Element operations
  const addElement = useCallback((element: MapElement) => {
    setElements((prev) => [...prev, element])
  }, [])

  const updateElement = useCallback((updatedElement: MapElement) => {
    updatedElement.isSynced = false;
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

  const updateFloors = useCallback((floors : FloorCollection)=>{
    setFloors((prev) => ({...prev,...floors}))
    setTotalFloors(floors.length)
  },[])

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

    const syncUnsyncedElements = useCallback(async () => {
    try {
      for (let floor = 1; floor <= totalFloors; floor++) {
        const floorKey = "mall-map-elements-" + floor;
        const storedElements: MapElement[] = loadFromStorage(floorKey, []);

        const unsynced = storedElements.filter(el => !el.isSynced);

        if (unsynced.length > 0) {
          await syncToServer("sync-elements", { elements: unsynced });

          const syncedElements = storedElements.map(el => {
            const matched = unsynced.find(u => u.id === el.id);
            return matched ? { ...el, isSynced: true } : el;
          });

          saveToStorage(floorKey, syncedElements);

          // If it's the current floor, also update in memory
          if (floor === currentFloor) {
            setElements(syncedElements);
          }
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
    }
  }, [totalFloors, currentFloor]);


  useEffect(() => {
    const interval = setInterval(() => {
      console.log('syned')
      syncUnsyncedElements()
    }, 5000)
  
    return () => clearInterval(interval)
  }, [syncUnsyncedElements])
  

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      elements,
      addElement,
      updateElement,
      removeElement,
      selectedElement,
      setSelectedElement,
      fetchFromServer,
      setFetchFromServer,
      floors,
      updateFloors,
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
      fetchFromServer,
      setFetchFromServer,
      floors,
      updateFloors,
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
