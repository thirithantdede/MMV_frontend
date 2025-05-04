"use client"

import type React from "react"

import { Suspense, lazy as reactLazy } from "react"
import { Loader2 } from "lucide-react"

// Custom lazy loading function with default loading component
export function lazy<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
) {
  const LazyComponent = reactLazy(importFunc)

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <DefaultLoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Default loading component
export function DefaultLoadingComponent() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[100px]">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )
}
