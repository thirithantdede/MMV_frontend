"use client"

import { memo, useState, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { LeftSidebar } from "@/components/layout/left-sidebar"
import { RightSidebar } from "@/components/layout/right-sidebar"
import { MainContent } from "@/components/layout/main-content"
import { MapSettingsDialog } from "@/components/panels/map-settings-dialog"
import { PublishDialog } from "@/components/panels/publish-dialog"
import { useMapEditor } from "@/context/map-editor-context"
import { Toaster } from "../ui/toaster"

// This component caches the layout components to improve performance
export const CachedLayout = memo(function CachedLayout() {
  const { showLeftPanel, showRightPanel, toggleLeftPanel, toggleRightPanel } = useMapEditor()
  const [showMapSettings, setShowMapSettings] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)

  // Memoize callback functions to prevent unnecessary re-renders
  const handleOpenSettings = useCallback(() => setShowMapSettings(true), [])
  const handleOpenPublish = useCallback(() => setShowPublishDialog(true), [])


  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Memoized Header */}
      <Header onOpenSettings={handleOpenSettings} onOpenPublish={handleOpenPublish} />

      <div className="flex flex-1 overflow-hidden">
        {/* Memoized Left Sidebar */}
        <LeftSidebar isVisible={showLeftPanel} />

        {/* Memoized Main Content */}
        <MainContent onToggleLeftPanel={toggleLeftPanel} onToggleRightPanel={toggleRightPanel} />

        {/* Memoized Right Sidebar */}
        <RightSidebar isVisible={showRightPanel} />
      </div>

      {/* Lazy load dialogs only when needed */}
      {showMapSettings && <MapSettingsDialog open={showMapSettings} onOpenChange={setShowMapSettings} />}

      {showPublishDialog && <PublishDialog open={showPublishDialog} onOpenChange={setShowPublishDialog} />}

    </div>
  )
})
