"use client"

import { memo } from "react"
import { ElementPanel } from "@/components/panels/element-panel"

interface LeftSidebarProps {
  isVisible: boolean
}

export const LeftSidebar = memo(function LeftSidebar({ isVisible }: LeftSidebarProps) {
  if (!isVisible) {
    return <div className="w-0 border-r bg-background transition-all duration-300" />
  }

  return (
    <div className="w-64 border-r bg-background transition-all duration-300">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-4">
          <ElementPanel />
        </div>
      </div>
    </div>
  )
})
