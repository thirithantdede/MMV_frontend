"use client"

import type { ReactNode } from "react"
import { CachedMapEditorProvider } from "@/components/providers/cached-map-editor-provider"
import { Provider } from "react-redux"
import { userStore } from "@/redux/stores/user-store"
import { AuthProvider } from "@/context/auth-context"
import ProtectedRoute from "../auth/protected-route"

interface MapEditorProviderWrapperProps {
  children: ReactNode
}

export function MapEditorProviderWrapper({ children }: MapEditorProviderWrapperProps) {
  return <Provider store={userStore}>
    <AuthProvider>
      <CachedMapEditorProvider>
        {children}
      </CachedMapEditorProvider>
    </AuthProvider>
  </Provider>
}
