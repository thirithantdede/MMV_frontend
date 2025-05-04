"use client"

import { memo } from "react"
import { Route } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RouteButtonProps {
  onOpenRouteDialog: () => void
}

export const RouteButton = memo(function RouteButton({ onOpenRouteDialog }: RouteButtonProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10">
      <Button onClick={onOpenRouteDialog} className="gap-2">
        <Route className="h-4 w-4" />
        Find Route
      </Button>
    </div>
  )
})
