"use client"

import { useState, useEffect, memo, useCallback } from "react"
import { Building, CloudIcon as CloudSync, Check } from "lucide-react"
import useQuery from "@/hooks/use-query"
import { saveToStorage, useMapEditor } from "@/context/map-editor-context"

interface LoadingScreenProps {
  onComplete: () => void
  skipLoading?: boolean
}

import LogoIcon from "@/public/imgs/logo-icon.png"
import Image from "next/image"


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
    // add isSyned true to buidling footprint
    // Add `isSynced: true` to building_footprint
    const updatedBuildingFootprint = {
      ...building_footprint,
      isSynced: true,
    };

    updateMapSettings(updatedBuildingFootprint)
    updateFloors(floors)

    elements.forEach((element: any) => {
      const updatedElements = element.elements.filter((ela: any) => ela.floor != 0).map((el: any) => ({
        ...el,
        isSynced: true,
        isDeleted: false,

      }));

      if (element.level == 1) {
        const floorElements = element.elements.filter((ela: any) => ela.floor == 0).map((el: any) => ({
          ...el,
          isSynced: true,
          isDeleted: false,


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
    <div className="inset-0 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 z-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />


      <div className="w-full max-w-lg px-8 py-12 flex flex-col items-center relative">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/10 rounded-3xl p-8 w-full">
          {/* Logo Section */}
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-lg opacity-30 animate-pulse" />
              <div className="relative p-4 shadow-lg">
                <Image
                  src={LogoIcon || "/placeholder.svg"}
                  alt="Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Mall Map Viewer
            </h1>
            <p className="text-slate-600 text-lg">Loading your project workspace</p>
          </div>

          {/* Progress Section */}
          <div className="w-full mb-6 space-y-3">
            <div className="flex justify-between items-center text-sm text-slate-600">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="relative">
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-slate-800 to-gray-900 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="flex items-center justify-center gap-3 text-sm bg-slate-50/50 rounded-xl p-4 border border-slate-200/50">
            {isComplete ? (
              <>
                <div className="relative">
                  <Check className="h-6 w-6 text-green-500 animate-in fade-in zoom-in duration-300" />
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                </div>
                <span className="text-green-600 font-medium text-base">{status}</span>
              </>
            ) : (
              <>
                <div className="relative">
                  <CloudSync className="h-6 w-6 text-slate-500 animate-spin" />
                  <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse" />
                </div>
                <span className="text-slate-700 font-medium">{status}</span>
              </>
            )}
          </div>

          {/* Loading Steps Indicator */}
          <div className="mt-6 flex justify-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${progress >= 30 ? "bg-slate-300" : "bg-slate-300"}`}
            />
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${progress >= 60 ? "bg-green-200" : "bg-slate-300"}`}
            />
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${progress >= 85 ? "bg-green-300" : "bg-slate-300"}`}
            />
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${progress >= 100 ? "bg-green-500" : "bg-slate-300"}`}
            />
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">Preparing your mall mapping experience</p>
        </div>
      </div>
    </div>
  )
})
