"use client"
import { useState, useCallback } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { CachedLayout } from "@/components/layout/cached-layout"
import ProtectedRoute from "@/components/auth/protected-route"


// Main layout component that uses the context
export default function ShoppingMallMapEditor() {
  const [isLoading, setIsLoading] = useState(true)


  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
  }, [])


  // If loading, show the loading screen
  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return <ProtectedRoute><CachedLayout  /></ProtectedRoute>
}
