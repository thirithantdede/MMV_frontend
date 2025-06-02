"use client"

import { memo } from "react"
import { Clock, LockOpenIcon as LockClosedIcon, AlertCircle, Tag, Percent, CalendarDays } from "lucide-react"
import type { MapElement, MapSettings } from "@/types"
import { storeTypes } from "@/utils/global"

interface ElementBadgesProps {
  element: MapElement
  mapsetting?: MapSettings
}

export const ElementBadges = memo(function ElementBadges({ element, mapsetting }: ElementBadgesProps) {
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

  // Use the same calculation logic as map-element.tsx
  const minDimension = Math.min(element.width, element.height)
  const fontSize = Math.min(Math.max(0.15 * minDimension, 10), 24)
  const iconSize = Math.min(Math.max(0.4 * minDimension, 16), 48)

  // Use the same font size mapping as map-element.tsx
  const getFontSizeClass = (size: number) => {
    if (size <= 12) return "text-xs"
    if (size <= 14) return "text-sm"
    if (size <= 16) return "text-md"
    if (size <= 18) return "text-lg"
    if (size <= 20) return "text-xl"
    return "text-2xl"
  }

  // Use the same icon size mapping as map-element.tsx
  const getIconSizeClass = (size: number) => {
    if (size <= 16) return "h-4 w-4"
    if (size <= 24) return "h-6 w-6"
    if (size <= 32) return "h-8 w-8"
    if (size <= 40) return "h-10 w-10"
    return "h-12 w-12"
  }

  const fontSizeClass = getFontSizeClass(fontSize)
  const iconSizeClass = getIconSizeClass(iconSize)

  // Calculate badge-specific sizes (slightly smaller than main element)
  const badgeFontSize = Math.max(fontSize * 0.7, 8) // 70% of main font size, minimum 8px
  const badgeIconSize = Math.max(iconSize * 0.5, 12) // 50% of main icon size, minimum 12px

  const getBadgeFontSizeClass = (size: number) => {
    if (size <= 10) return "text-[8px]"
    if (size <= 12) return "text-[10px]"
    if (size <= 14) return "text-xs"
    if (size <= 16) return "text-sm"
    return "text-md"
  }

  const getBadgeIconSizeClass = (size: number) => {
    if (size <= 12) return "h-3 w-3"
    if (size <= 16) return "h-4 w-4"
    if (size <= 20) return "h-5 w-5"
    return "h-6 w-6"
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
