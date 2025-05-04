"use client"

import type { ReactNode } from "react"
import { CachedMapEditorProvider } from "@/components/providers/cached-map-editor-provider"

interface MapEditorProviderWrapperProps {
  children: ReactNode
}

export function MapEditorProviderWrapper({ children }: MapEditorProviderWrapperProps) {
  return <CachedMapEditorProvider>{children}</CachedMapEditorProvider>
}
