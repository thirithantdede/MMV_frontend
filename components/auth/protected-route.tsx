"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated && isInitializing === "unauthenticated") {
      router.push("/login")
    }
  }, [isAuthenticated, router, isInitializing])

  if (isInitializing === "initializing") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{"Redirecting"}</h1>
      </div>
    )
  }

  if (!isAuthenticated && isInitializing === "unauthenticated") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{"Redirecting"}</h1>
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 h-full w-full animate-ping rounded-full bg-primary/20 opacity-75"></div>
          <div className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-primary"></div>
        </div>
        <div className="flex items-center justify-center text-lg text-muted-foreground">
          <span>Taking you to</span>
          <span className="ml-2 flex items-center font-medium text-foreground">{"Login Page!"}</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
