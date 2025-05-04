"use client"

import { memo } from "react"
import { PropertyPanel } from "@/components/panels/property-panel"

interface RightSidebarProps {
  isVisible: boolean
}

export const RightSidebar = memo(function RightSidebar({ isVisible }: RightSidebarProps) {
  if (!isVisible) {
    return <div className="w-0 border-l bg-background transition-all duration-300" />
  }

  return (
    <div className="w-80 border-l bg-background transition-all duration-300">
      <div className="h-full overflow-auto p-4">
        <PropertyPanel />
      </div>
    </div>
  )
})
