"use client"

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react"
import { FloorCollection, Project, type MapElement, type MapSettings } from "@/types"
import useMutate from "@/hooks/use-mutate"
import { useDragElement } from "@/hooks/use-drag-element"
import { toast } from "@/hooks/use-toast"

interface MapEditorContextType {
  // Map elements
  elements: MapElement[]
  addElement: (element: MapElement) => void
  updateElement: (element: MapElement) => void
  removeElement: (id: string) => void

  project : Project
  updateProject: (project: Project) => void

  fetchFromServer: boolean,
  setFetchFromServer: (isFetchFromServer: boolean) => void
  // Selection
  selectedElement: MapElement | null
  setSelectedElement: (element: MapElement | null) => void

  isSyncing : boolean,
  setIsSyncing: (isSyncing : boolean) => void

  // Floor management
  floors: FloorCollection | null
  updateFloors: (floors: FloorCollection) => void
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
// Helper function to load state from localStorage
export const loadFromStorage = <T extends object>(
  key: string,
  defaultValue: T,
  fe: boolean = false
): T => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const sv = localStorage.getItem(key);
    const storedValue = sv ? JSON.parse(sv) : {};
    
    const floorRaw = localStorage.getItem("floor-elements");
    const floorElements = floorRaw ? JSON.parse(floorRaw) : [];

    if (fe) {
      const isStoredEmpty = Object.keys(storedValue).length === 0;
      const isFloorEmpty = Object.keys(floorElements).length === 0;

      if (isStoredEmpty && isFloorEmpty) {
        return [] as T;
      }

      return [
        ...storedValue,
        ...floorElements,
       ] as T;
    } else {
      return storedValue as T;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};




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
  const [elements, setElements] = useState<MapElement[]>(() => loadFromStorage("mall-map-elements-" + currentFloor, [],true))
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [fetchFromServer, setFetchFromServer] = useState<boolean>(true);

  const [floors, setFloors] = useState<FloorCollection | null>(null)
  const [project, setProject] = useState<Project>(()=>loadFromStorage("mall-project", []) as unknown as Project)
  const [selectedElement, setSelectedElement] = useState<MapElement | null>(null)
  // Floor state
  const [totalFloors, setTotalFloors] = useState(2)

  // Map settings - load from localStorage if available
  const [mapSettings, setMapSettings] = useState<MapSettings>(() =>
    loadFromStorage("mall-map-settings", {
      width: 1600,
      height: 1000,
      grid_size: 20,
      show_grid: true,
      show_opening_hours : false,
      building_width: 1200,
      building_height: 800,
      building_x: 700,
      building_y: 400,
      restricted: true,
      isSynced : true
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

  const [syncToServer, { isLoading,isError,error }] = useMutate({ callback: undefined });

  // Save elements to localStorage whenever they change
  useEffect(() => {
    setElements(loadFromStorage("mall-map-elements-" + currentFloor, [],true))
  }, [currentFloor,isSyncing])

  useEffect(()=>{
    if(isError){
      toast({
      title: "Error",
      description: error?.data?.message,
      variant: "destructive"
    })
    }
  },[isError])

  useEffect(() => {
    const toSaveElements = elements.filter(el => el.floor != 0);
    saveToStorage("mall-map-elements-" + currentFloor, toSaveElements)
    const floorElements = elements.filter(el => el.floor == 0);
    saveToStorage("floor-elements", floorElements)
  }, [elements])

  // Save map settings to localStorage whenever they change
  useEffect(() => {
    saveToStorage("mall-map-settings", mapSettings)
  }, [mapSettings])

  // Element operations
  const addElement = useCallback((element: MapElement) => {
    setElements((prev) => [...prev, element]);
}, [totalFloors]);


  const updateElement = useCallback((updatedElement: MapElement) => {
    updatedElement.isSynced = false;
    setElements((prev) => prev.map((el) => (el.id === updatedElement.id ? updatedElement : el)))
  }, [])

  const removeElement = useCallback((id: string) => {
    syncToServer("delete-element", { id })
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

  const updateProject = useCallback((project: Project) => {
    setProject(project)
    saveToStorage("mall-project", project)
  }, [])

  // Panel toggles
  const toggleLeftPanel = useCallback(() => {
    setShowLeftPanel((prev) => !prev)
  }, [])

  const toggleRightPanel = useCallback(() => {
    setShowRightPanel((prev) => !prev)
  }, [])

  const updateFloors = useCallback((floors: FloorCollection) => {
    setFloors((prev) => ({ ...prev, ...floors }))
    setTotalFloors(floors.length)
  }, [])

  // Map settings update
  const updateMapSettings = useCallback((settings: Partial<MapSettings>) => {
    setMapSettings((prev) => ({ ...prev, ...settings }))
  }, [mapSettings])

  // Zoom controls - updated min zoom to 0.3 (30%)
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 3))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.3))
  }, [])

  const syncUnsyncedElements = useCallback(async () => {
    try {
      const checkMap = loadFromStorage("mall-map-settings", {}) as MapSettings;
      if(checkMap.isSynced == false) {
         const mapFromLocalStorage = loadFromStorage("mall-map-settings", {});
         const response = await syncToServer("sync-map", { map_setting: mapFromLocalStorage });
         const responseMap = response?.data ?? [];
         const updatedMap = {...responseMap, isSynced: true };
         console.log('updatedMap', updatedMap);
        
          setMapSettings((prev) => ({ ...prev, ...updatedMap}));
          saveToStorage("mall-map-settings", updatedMap)
      }

      for (let floor = 1; floor <= totalFloors; floor++) {
        const floorKey = "mall-map-elements-" + floor;
        const storedElements: MapElement[] = loadFromStorage(floorKey, [],true);

        let unsynced = storedElements.filter(el => !el.isSynced);
        if(floor != 1) {
          unsynced = storedElements.filter(el => !el.isSynced && el.floor != 0);
        }
        if (unsynced.length > 0) {
          const response = await syncToServer("sync-elements", { elements: unsynced });
          const responseElements: MapElement[] = response?.data ?? [];
          const updated = storedElements.filter(localEl => localEl.floor !== 0).map(localEl => {
            const matched = responseElements.find(serverEl =>
            serverEl.old_element_id == localEl.id || serverEl.id == localEl.id 
            )
            if (matched) {
              return {
                ...localEl,
                ...matched,
                id: matched.id,
                isSynced: true
              }
            }

            return localEl;
          })
          saveToStorage(floorKey, updated);

          const floorUpdated =storedElements.filter(localEl => localEl.floor == 0).map(localEl => {
            const matched = responseElements.find(serverEl =>
            serverEl.old_element_id == localEl.id || serverEl.id == localEl.id
            )
            if(matched){
              return {
                 ...localEl,
                ...matched,
                id: matched.id,
                isSynced: true
              }
            }
            return localEl
          })

          saveToStorage("floor-elements",floorUpdated)

          if (floor == currentFloor) {
            const allUpdated = [...updated,...floorUpdated]
            setElements(allUpdated as any);
          }
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
    }
  }, [totalFloors, currentFloor, mapSettings]);


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
      project,
      updateProject,
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
      isSyncing,
      setIsSyncing
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
      project,
      updateProject,
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
      isSyncing,
      setIsSyncing
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
