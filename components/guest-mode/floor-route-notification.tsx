"use client"

import { memo } from "react"
import type { RoutePoint } from "@/types"

interface FloorRouteNotificationProps {
  path: RoutePoint[]
  currentFloor: number
  show: boolean
}

export const FloorRouteNotification = memo(function FloorRouteNotification({
  path,
  currentFloor,
  show,
}: FloorRouteNotificationProps) {
  if (!show) return null

  return (
    <div className="absolute top-20 left-1/2 z-30 -translate-x-1/2 transform bg-blue-600 text-white px-4 py-2 rounded-md text-sm animate-pulse">
      This route continues on{" "}
      {path
        .filter((p) => p.floor !== currentFloor)
        .map((p) => `Floor ${p.floor}`)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(", ")}
    </div>
  )
})
