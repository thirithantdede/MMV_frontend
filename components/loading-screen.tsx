"use client"

import { useState, useEffect, memo, useCallback } from "react"
import { Building, CloudIcon as CloudSync, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import useQuery from "@/hooks/use-query"
import { saveToStorage, useMapEditor } from "@/context/map-editor-context"

interface LoadingScreenProps {
  onComplete: () => void
  skipLoading?: boolean
}

export const LoadingScreen = memo(function LoadingScreen({ onComplete, skipLoading = false }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Connecting to server...")
  const [isComplete, setIsComplete] = useState(false)

  const { updateMapSettings, updateFloors, setFetchFromServer, setIsSyncing } = useMapEditor()

  const authQuery = useQuery("/auth-check")
  const projectDataQuery = useQuery("/project-data", { enabled: authQuery.data && !authQuery.isLoading })
  const projectElementsQuery = useQuery("/project-elements", { enabled: projectDataQuery.data && !projectDataQuery.isLoading })

  // Sync to context + localStorage
  const syncToLocal = useCallback(() => {
    if (!projectDataQuery.data) return

    const { building_footprint, floors } = projectDataQuery.data
    const { elements } = projectElementsQuery?.data
    updateMapSettings(building_footprint)
    updateFloors(floors)

    elements.forEach((element: any) => {
      const updatedElements = element.elements.filter((ela: any) => ela.floor != 0).map((el: any) => ({
        ...el,
        isSynced: true,
      }));

      if (element.level == 1) {
        const floorElements = element.elements.filter((ela: any) => ela.floor == 0).map((el: any) => ({
          ...el,
          isSynced: true,
        }));
        saveToStorage("floor-elements", floorElements);

      }

      saveToStorage("mall-map-elements-" + element.level, updatedElements);
    });

    return true;

  }, [projectDataQuery.data, projectElementsQuery.data, updateMapSettings, updateFloors])

  // Step-by-step loading effect
  useEffect(() => {
    if (skipLoading) {
      onComplete()
      return
    }

    const loadSteps = async () => {
      setFetchFromServer(false);
      setIsSyncing(false);
      if (authQuery.isLoading && projectDataQuery.isLoading) {
        setStatus("Checking authentication...")
        setProgress(30)
        return
      }
      if (!authQuery.isLoading && projectDataQuery.isLoading) {
        setStatus("Loading project data...")
        setProgress(60)

        return
      }

      if (!authQuery.isLoading && !projectDataQuery.isLoading && projectElementsQuery.isLoading) {
        setStatus("Loading map elements...")
        setProgress(85)

        return
      }

      if (projectDataQuery.data && projectElementsQuery.data) {
        setStatus("Syncing local storage...")
        syncToLocal()
        setIsComplete(true)
      }

      if (isComplete) {
        setStatus("Ready!")
        setTimeout(onComplete, 1200)
        setProgress(100)
        setFetchFromServer(true);
        setIsSyncing(true)
      }
    }

    loadSteps()
  }, [
    skipLoading,
    onComplete,
    authQuery.data,
    authQuery.isLoading,
    projectDataQuery.data,
    projectDataQuery.isLoading,
    projectElementsQuery.data,
    projectElementsQuery.isLoading,
    syncToLocal,
    isComplete
  ])

  if (skipLoading) return null

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="w-full max-w-md px-8 py-12 flex flex-col items-center">
        <div className="mb-8 flex items-center justify-center">
          <Building className="h-16 w-16 text-primary" />
        </div>

        <h1 className="text-2xl font-bold mb-2 text-center">Mall Map Viewer</h1>
        <p className="text-muted-foreground mb-8 text-center">Loading your project</p>

        <div className="w-full mb-4">
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center gap-3 text-sm">
          {isComplete ? (
            <>
              <Check className="h-5 w-5 text-green-500 animate-in fade-in" />
              <span className="text-green-500 font-medium">{status}</span>
            </>
          ) : (
            <>
              <CloudSync className="h-5 w-5 text-primary animate-spin" />
              <span>{status}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
})
