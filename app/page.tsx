"use client"
import { useState, useCallback } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { CachedLayout } from "@/components/layout/cached-layout"
import ProtectedRoute from "@/components/auth/protected-route"
import { toast } from "@/hooks/use-toast"

// Main layout component that uses the context
export default function ShoppingMallMapEditor() {
  const [isLoading, setIsLoading] = useState(false)


  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
    localStorage.set("has-seen-loading", "true")
  }, [localStorage])


  // If loading, show the loading screen
  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return <ProtectedRoute><CachedLayout  /></ProtectedRoute>
}
