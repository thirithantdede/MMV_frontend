"use client"

import type React from "react"
import { memo } from "react"
import { ElementIcon } from "@/components/map/element-icon"
import { ElementBadges } from "@/components/map/element-badges"
import type { MapElement, MapSettings } from "@/types"

interface MapElementProps {
  element: MapElement
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
  onDragStart: (e: React.MouseEvent) => void
  isGuestMode?: boolean
  isHighlighted?: boolean
  mapsetting?: MapSettings
}

export const MapElementComponent = memo(function MapElementComponent({
  element,
  isSelected,
  onClick,
  onDragStart,
  isGuestMode = false,
  isHighlighted = false,
  mapsetting,
}: MapElementProps) {
  const isVerticalTransport = ["elevator", "escalator", "stairs"].includes(element.type)
  const isClosed = element.is_closed || false

  // Calculate font and icon sizes based on element dimensions
  const minDimension = Math.min(element.width, element.height)
  const fontSize = Math.min(Math.max(0.15 * minDimension, 10), 24)
  const iconSize = Math.min(Math.max(0.4 * minDimension, 16), 48)

  // Map calculated sizes to Tailwind classes
  const getFontSizeClass = (size: number) => {
    if (size <= 12) return "text-xs"
    if (size <= 14) return "text-sm"
    if (size <= 16) return "text-md"
    if (size <= 18) return "text-lg"
    if (size <= 20) return "text-xl"
    return "text-2xl"
  }

  const getIconSizeClass = (size: number) => {
    if (size <= 16) return "h-4 w-4"
    if (size <= 24) return "h-6 w-6"
    if (size <= 32) return "h-8 w-8"
    if (size <= 40) return "h-10 w-10"
    return "h-12 w-12"
  }

  const fontSizeClass = getFontSizeClass(fontSize)
  const iconSizeClass = getIconSizeClass(iconSize)

  // Calculate max characters for element name based on width and font size
  const availableWidth = element.width - 8 - 4 // Subtract padding (8px) and border (4px)
  const avgCharWidth = 0.6 * fontSize // Estimate average character width
  const maxChars = Math.min(Math.max(Math.floor(availableWidth / avgCharWidth), 5), 50)
  const displayName = element.name.length > maxChars ? `${element.name.substring(0, maxChars)}...` : element.name
  const displayCategory = element?.shop_information?.category || ""

  // Determine border color
  const borderColor = isSelected ? undefined : isHighlighted ? undefined : element.border_color || "#6B7280" // Fallback to gray-500

  // Dynamically adjust category badge background and border for a more specular look
  const categoryBgColor = element.color ? `color-mix(in srgb, ${element.color} 70%, #1D4ED8)` : "#1D4ED8" // Mix with blue-700 for vibrancy
  const categoryBorderColor = element.color ? `color-mix(in srgb, ${element.color} 50%, #1E40AF)` : "#1E40AF" // Mix with blue-800 for contrast

  return (
    <div
      className={`absolute flex flex-col items-center justify-center rounded-md border-2 ${
        isSelected ? "border-primary" : isHighlighted ? "border-green-500 border-4" : "border-gray-500"
      } ${isGuestMode ? "cursor-pointer" : "cursor-move"} overflow-hidden select-none ${
        isClosed ? "grayscale opacity-70" : ""
      } map-element ${isHighlighted ? "animate-pulse-slow" : ""} ${
        isVerticalTransport ? "floor-transition-element" : ""
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        backgroundColor: element.color,
        borderColor, // Apply dynamic border color only when not selected or highlighted
        opacity: element.opacity ? element.opacity / 100 : 1,
        borderTopLeftRadius: `${element.border_radius.topLeft}px`,
        borderTopRightRadius: `${element.border_radius.topRight}px`,
        borderBottomRightRadius: `${element.border_radius.bottomRight}px`,
        borderBottomLeftRadius: `${element.border_radius.bottomLeft}px`,
        borderStyle: element.border_style || "solid",
        transform: element.rotation ? `rotate(${element.rotation}deg) translate3d(0,0,0)` : "translate3d(0,0,0)",
        willChange: "transform, left, top, opacity",
        userSelect: "none",
        boxShadow: isHighlighted ? "0 0 15px rgba(34, 197, 94, 0.7)" : undefined,
      }}
      onClick={onClick}
      onMouseDown={isGuestMode ? undefined : onDragStart}
    >
      <ElementIcon type={element.type} className={iconSizeClass} />
      <span
        className={`mt-1 font-bold pointer-events-none ${fontSizeClass} text-center truncate`}
        style={{ maxWidth: `${availableWidth}px` }}
      >
        {displayName}
      </span>
      {displayCategory && (
        <div className="absolute top-2 left-2 pointer-events-none">
          <span
            className={`inline-flex items-center px-2 py-1 text-sm font-medium  shadow-sm border ${
              fontSizeClass.includes("xs") || fontSizeClass.includes("sm") ? "rounded" : "rounded-full"
            }`}
            style={{
              backgroundColor: categoryBgColor,
              borderColor: categoryBorderColor,
              borderRadius: `${
                fontSizeClass.includes("xs") || fontSizeClass.includes("sm")
                  ? Math.min(element.border_radius.topLeft / 1.5, 8)
                  : Math.min(element.border_radius.topLeft, 12)
              }px`,
              backgroundImage: `linear-gradient(145deg, ${categoryBgColor}, color-mix(in srgb, ${categoryBgColor} 80%, #ffffff))`,
              boxShadow: `0 0 8px color-mix(in srgb, ${categoryBgColor} 70%, #ffffff)`,
              minWidth: "40px", // Ensure minimum width to prevent text clipping
            }}
          >
            {displayCategory.length > 8 ? `${displayCategory.substring(0, 8)}...` : displayCategory}
          </span>
        </div>
      )}
      <ElementBadges element={element} mapsetting={mapsetting} />
    </div>
  )
})