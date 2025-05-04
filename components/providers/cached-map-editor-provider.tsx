"use client"

import { memo } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { MapEditorProvider } from "@/context/map-editor-context"
import type { ReactNode } from "react"

interface CachedMapEditorProviderProps {
  children: ReactNode
}

// Cache the provider wrapper to prevent unnecessary re-renders
export const CachedMapEditorProvider = memo(function CachedMapEditorProvider({
  children,
}: CachedMapEditorProviderProps) {
  return (
    <DndProvider backend={HTML5Backend} options={{ enableMouseEvents: true }}>
      <MapEditorProvider>{children}</MapEditorProvider>
    </DndProvider>
  )
})
