"use client"

import { useState, useEffect, memo } from "react"
import { Building, CloudIcon as CloudSync, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface LoadingScreenProps {
  onComplete: () => void
  skipLoading?: boolean
}

export const LoadingScreen = memo(function LoadingScreen({ onComplete, skipLoading = false }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Connecting to server...")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Skip loading if requested
    if (skipLoading) {
      onComplete()
      return
    }

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + 4 // Increase by 4% each time to reach 100% in about 3 seconds
      })
    }, 100)

    // Update status messages
    const statusMessages = [
      { time: 0, message: "Connecting to server..." },
      { time: 800, message: "Syncing project data..." },
      { time: 1600, message: "Loading map elements..." },
      { time: 2400, message: "Preparing editor..." },
      { time: 3000, message: "Ready!" },
    ]

    // Set up timers for each status message
    const timers = statusMessages.map(({ time, message }) =>
      setTimeout(() => {
        setStatus(message)
        if (time === 3000) {
          setIsComplete(true)
          setTimeout(() => onComplete(), 500) // Wait a bit after showing "Ready!" before transitioning
        }
      }, time),
    )

    // Clean up all timers
    return () => {
      clearInterval(interval)
      timers.forEach(clearTimeout)
    }
  }, [onComplete, skipLoading])

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
