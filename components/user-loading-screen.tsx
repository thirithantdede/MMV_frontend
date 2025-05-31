"use client"

import { useState, useEffect, memo, useCallback } from "react"
import { CloudIcon as CloudSync, Check, AlertCircle } from "lucide-react"
import useQuery from "@/hooks/use-query"
import { saveToStorage, useMapEditor } from "@/context/map-editor-context"
import { Button } from "@/components/ui/button"
import LogoIcon from "@/public/imgs/logo-icon.png"
import Image from "next/image"

interface LoadingScreenProps {
  onComplete: () => void
  skipLoading?: boolean
  project_uri: string
}

interface QueryErrorInterface {
  status: number
  data: any
}

export const UserLoadingScreen = memo(function LoadingScreen({
  onComplete,
  skipLoading = false,
  project_uri,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Connecting to server...")
  const [localSynced, setLocalSynced] = useState(false)
  const [syncStarted, setSyncStarted] = useState(false)
  const [finished, setFinished] = useState(false)

  const {
    updateMapSettings,
    updateProject,
    updateFloors,
    setFetchFromServer,
    setIsSyncing,
  } = useMapEditor()

  const projectDataQuery = useQuery(`/projects/${project_uri}`)
  
  const syncToLocal = useCallback(() => {
    
    if(projectDataQuery.isLoading) return;
    const { building_footprint, floors, project, elements } = projectDataQuery.data.data

    const updatedBuildingFootprint = {
      ...building_footprint,
      isSynced: true,
    }


    updateMapSettings(updatedBuildingFootprint)
    updateFloors(floors)

    elements.forEach((element: any) => {
      const updatedElements = element.elements
        .filter((ela: any) => ela.floor !== 0)
        .map((el: any) => ({ ...el, isSynced: true, isDeleted: false }))

      if (element.level === 1) {
        const floorElements = element.elements
          .filter((ela: any) => ela.floor === 0)
          .map((el: any) => ({ ...el, isSynced: true, isDeleted: false }))
        saveToStorage("floor-elements", floorElements)
      }

      updateProject(project)
      saveToStorage("mall-map-elements-" + element.level, updatedElements)
    })

    setStatus("Syncing local storage...")
    setProgress(95)
    setLocalSynced(true)
  }, [projectDataQuery.data,projectDataQuery.isLoading, updateMapSettings, updateFloors, updateProject])

  useEffect(() => {
    if (skipLoading) {
      onComplete()
      return
    }

    setFetchFromServer(false)
    setIsSyncing(false)

    if (projectDataQuery.error) {
      const error = projectDataQuery.error as QueryErrorInterface
      if (error.status === 404) {
        setStatus("Project not found")
        setProgress(0)
        return
      }
    }

    if (!projectDataQuery.isLoading && projectDataQuery.data && !syncStarted) {
      setStatus("Loading map elements...")
      setProgress(85)
      setSyncStarted(true)
      syncToLocal()
    }

    if (localSynced && !finished) {
      setStatus("Ready!")
      setProgress(100)
      setFinished(true)

      setTimeout(() => {
        setFetchFromServer(true)
        setIsSyncing(true)
        onComplete()
      }, 500)
    }
  }, [
    skipLoading,
    onComplete,
    projectDataQuery.isLoading,
    projectDataQuery.data,
    projectDataQuery.error,
    localSynced,
    finished,
    syncStarted,
    syncToLocal,
    setFetchFromServer,
    setIsSyncing,
  ])

  if (skipLoading) return null

  if (projectDataQuery.error && (projectDataQuery.error as QueryErrorInterface).status === 404) {
    return (
      <div className="inset-0 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-rose-100 z-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-red-500/10 rounded-3xl p-10 max-w-md text-center">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Project Not Found</h2>
        <p className="text-slate-600 mb-4">We couldn't find the project with URI <strong>{project_uri}</strong>. It may have been deleted or archieved.</p>
        <Button variant="outline" onClick={() => window.location.href = "/"} className="mt-2">
          Go Back Home
        </Button>
      </div>
    </div>
    )
  }

  return (
    <div className="inset-0 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 z-50 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="w-full max-w-lg px-8 py-12 flex flex-col items-center relative">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/10 rounded-3xl p-8 w-full">
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-lg opacity-30 animate-pulse" />
              <div className="relative p-4 shadow-lg">
                <Image src={LogoIcon || "/placeholder.svg"} alt="Logo" width={60} height={60} className="object-contain" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            <span className="capitalize">{project_uri}</span>
            </h1>
            <p className="text-slate-600 text-lg">Loading The Project </p>
          </div>

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

          <div className="flex items-center justify-center gap-3 text-sm bg-slate-50/50 rounded-xl p-4 border border-slate-200/50">
            {finished ? (
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

          <div className="mt-6 flex justify-center space-x-2">
            {[30, 60, 85, 100].map((step, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  progress >= step ? `bg-green-500` : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">Preparing your mall mapping experience</p>
        </div>
      </div>
    </div>
  )
})
