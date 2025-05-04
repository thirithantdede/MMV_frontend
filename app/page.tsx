"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import { CachedLayout } from "@/components/layout/cached-layout"

// Main layout component that uses the context
export default function ShoppingMallMapEditor() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    // In a real app, this would check a token or session
    // For this demo, we'll just check if they've visited the login page
    const hasLoggedIn = localStorage.getItem("hasLoggedIn")
    if (!hasLoggedIn) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)

      // Check if we should skip the loading screen
      const hasSeenLoading = localStorage.getItem("has-seen-loading")
      if (hasSeenLoading) {
        setIsLoading(false)
      }
    }
  }, [router])

  // Handle loading completion
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
    localStorage.setItem("has-seen-loading", "true")
  }, [])

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // If loading, show the loading screen
  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return <CachedLayout />
}
