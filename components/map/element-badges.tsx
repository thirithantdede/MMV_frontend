"use client"

import { memo } from "react"
import { Clock, LockOpenIcon as LockClosedIcon, AlertCircle, Tag, Percent, CalendarDays } from "lucide-react"
import type { MapElement } from "@/types"

interface ElementBadgesProps {
  element: MapElement
}

export const ElementBadges = memo(function ElementBadges({ element }: ElementBadgesProps) {
  const isClosed = element.isClosed || false
  const hasPromotion = element.type === "store" && element.hasPromotion
  const isActiveEvent =
    element.type === "event" &&
    element.is_active &&
    element.start_date &&
    element.end_date &&
    new Date(element.start_date) <= new Date() &&
    new Date(element.end_date) >= new Date()
  const isEventFree = element.type === "event" && element.is_foc

  return (
    <>
      {/* Show closed indicator if store is closed */}
      {isClosed && (
        <div className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md">
          <LockClosedIcon className="h-3 w-3" />
        </div>
      )}

      {/* Show promotion indicator if store has promotion */}
      {hasPromotion && !isClosed && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-white p-1 rounded-bl-md animate-pulse-slow">
          <Percent className="h-3 w-3" />
        </div>
      )}

      {/* Show open hours indicator if available */}
      {element.type === "store" && element.openHours && !isClosed && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] p-0.5 flex items-center justify-center">
          <Clock className="h-2 w-2 mr-0.5" />
          {element.openHours}
        </div>
      )}

      {element.type === "store" && element.closedDay && element.closedDay !== "none" && (
        <div className="absolute top-0 left-0 bg-amber-500 text-white text-[8px] p-0.5 rounded-br-md">
          Closed: {element.closedDay.charAt(0).toUpperCase() + element.closedDay.slice(1)}
        </div>
      )}

      {/* Show active event notification */}
      {isActiveEvent && (
        <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-bl-md animate-pulse">
          <AlertCircle className="h-3 w-3" />
        </div>
      )}

      {/* Show free event badge */}
      {isEventFree && (
        <div className="absolute top-0 left-0 bg-green-500 text-white text-[8px] p-0.5 rounded-br-md">Free Entry</div>
      )}

      {/* Show event date range if it's an event */}
      {element.type === "event" && element.start_date && element.end_date && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] p-0.5 flex items-center justify-center">
          <CalendarDays className="h-2 w-2 mr-0.5" />
          {new Date(element.start_date).toLocaleDateString()} - {new Date(element.end_date).toLocaleDateString()}
        </div>
      )}

      {/* Show host/company if available */}
      {element.type === "event" && element.host && (
        <div className="absolute top-8 left-0 right-0 bg-black/40 text-white text-[8px] p-0.5 flex items-center justify-center">
          <Tag className="h-2 w-2 mr-0.5" />
          {element.host}
        </div>
      )}
    </>
  )
})
