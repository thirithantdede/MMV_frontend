"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PreviewMode } from "@/components/preview-mode"

export default function PreviewPage() {
  const router = useRouter()
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
    }
  }, [router])

  const handleExitPreview = () => {
    router.push("/")
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return <PreviewMode onExitPreview={handleExitPreview} />
}
