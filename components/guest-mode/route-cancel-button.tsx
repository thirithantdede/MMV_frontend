"use client"

import { memo } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RouteCancelButtonProps {
  onCancelRoute: () => void
  visible: boolean
}

export const RouteCancelButton = memo(function RouteCancelButton({ onCancelRoute, visible }: RouteCancelButtonProps) {
  if (!visible) return null

  return (
    <div className="absolute bottom-16 right-4 z-10">
      <Button onClick={onCancelRoute} variant="destructive" className="gap-2">
        <X className="h-4 w-4" />
        Cancel Route
      </Button>
    </div>
  )
})
