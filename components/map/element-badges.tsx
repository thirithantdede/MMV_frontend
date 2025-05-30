"use client"

import { memo } from "react"
import { Clock, LockOpenIcon as LockClosedIcon, AlertCircle, Tag, Percent, CalendarDays } from "lucide-react"
import type { MapElement, MapSettings } from "@/types"
import { storeTypes } from "@/utils/global"

interface ElementBadgesProps {
  element: MapElement
  mapsetting?: MapSettings
}

export const ElementBadges = memo(function ElementBadges({ element,mapsetting }: ElementBadgesProps) {
  const isClosed = element.is_closed || false
  const hasPromotion = storeTypes.includes(element.type) && element.shop_information?.promotions.is_now
  const isActiveEvent =
    element.type === "event" &&
    element.event?.is_active &&
    element.event?.start_date &&
    element.event?.end_date &&
    new Date(element?.event?.start_date) <= new Date() &&
    new Date(element?.event?.end_date) >= new Date()
  const isEventFree = element.type === "event" && element.event?.is_foc

  // Calculate badge font and icon sizes based on element dimensions
  const minDimension = Math.min(element.width, element.height)
  const badgeFontSize = Math.min(Math.max(0.12 * minDimension, 6), 12)
  const badgeIconSize = Math.min(Math.max(0.25 * minDimension, 8), 16)

  // Map calculated sizes to Tailwind classes
  const getBadgeFontSizeClass = (size: number) => {
    if (size <= 7) return "text-[6px]"
    if (size <= 8) return "text-[7px]"
    if (size <= 9) return "text-[8px]"
    if (size <= 10) return "text-[9px]"
    if (size <= 11) return "text-[10px]"
    return "text-[11px]"
  }

  const getBadgeIconSizeClass = (size: number) => {
    if (size <= 8) return "h-2 w-2"
    if (size <= 12) return "h-3 w-3"
    return "h-4 w-4"
  }

  const badgeFontSizeClass = getBadgeFontSizeClass(badgeFontSize)
  const badgeIconSizeClass = getBadgeIconSizeClass(badgeIconSize)

  return (
    <>
      {/* Show closed indicator if store is closed */}
      {isClosed && (
        <div className={`absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md ${badgeFontSizeClass}`}>
          <LockClosedIcon className={badgeIconSizeClass} />
        </div>
      )}

      {/* Show promotion indicator if store has promotion */}
      {hasPromotion && !isClosed && (
        <div className={`absolute top-0 right-0 bg-yellow-500 text-white p-1 rounded-bl-md animate-pulse-slow ${badgeFontSizeClass}`}>
          <Percent className={badgeIconSizeClass} />
        </div>
      )}

      {/* Show open hours indicator if available */}
      {element.type === "store" && element.shop_information?.opening_hours && mapsetting?.show_opening_hours && !isClosed && (
        <div className={`absolute bottom-0 left-0 right-0 bg-black/60 text-white p-0.5 flex items-center justify-center ${badgeFontSizeClass}`}>
          <Clock className={`${badgeIconSizeClass} mr-0.5`} />
          {element.shop_information?.opening_hours.start} - {element.shop_information?.opening_hours.end}
        </div>
      )}

      {/* Show active event notification */}
      {isActiveEvent && (
        <div className={`absolute top-0 right-0 bg-green-500 text-white p-1 rounded-bl-md animate-pulse ${badgeFontSizeClass}`}>
          <AlertCircle className={badgeIconSizeClass} />
        </div>
      )}

      {/* Show free event badge */}
      {isEventFree && (
        <div className={`absolute top-0 left-0 bg-green-500 text-white p-0.5 rounded-br-md ${badgeFontSizeClass}`}>
          Free Entry
        </div>
      )}

      {/* Show event date range if it's an event */}
      {element.type === "event" && element.event?.start_date && element.event?.end_date && (
        <div className={`absolute bottom-0 left-0 right-0 bg-black/60 text-white p-0.5 flex items-center justify-center ${badgeFontSizeClass}`}>
          <CalendarDays className={`${badgeIconSizeClass} mr-0.5`} />
          {new Date(element.event?.start_date).toLocaleDateString()} - {new Date(element.event?.end_date).toLocaleDateString()}
        </div>
      )}
    </>
  )
})