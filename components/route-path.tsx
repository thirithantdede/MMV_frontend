"use client"

import { memo, useMemo, useEffect, useState, useRef } from "react"
import { ArrowUp, ArrowDown, Navigation, MapPin } from "lucide-react"
import type { RouteInfo } from "@/types"

interface RoutePathProps {
  routeInfo: RouteInfo
  currentFloor: number
}

export const RoutePath = memo(function RoutePath({ routeInfo, currentFloor }: RoutePathProps) {
  const { sourceStore, targetStore, path } = routeInfo
  const [animationProgress, setAnimationProgress] = useState(0)
  const animationRef = useRef<number | null>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)

  // Filter path points for current floor
  const floorPath = useMemo(() => {
    return path.filter((point) => point.floor === currentFloor)
  }, [path, currentFloor])

  // Find floor transition points
  const floorTransitions = useMemo(() => {
    const transitions = []
    for (let i = 0; i < path.length - 1; i++) {
      if (path[i].floor !== path[i + 1].floor) {
        transitions.push({
          x: path[i].x,
          y: path[i].y,
          fromFloor: path[i].floor,
          toFloor: path[i + 1].floor,
        })
      }
    }
    return transitions
  }, [path])

  // Get current floor transitions
  const currentFloorTransitions = useMemo(() => {
    return floorTransitions.filter((transition) => transition.fromFloor === currentFloor)
  }, [floorTransitions, currentFloor])

  // Calculate path segments for animation
  const pathSegments = useMemo(() => {
    if (floorPath.length < 2) return []

    const segments = []
    for (let i = 0; i < floorPath.length - 1; i++) {
      segments.push({
        start: floorPath[i],
        end: floorPath[i + 1],
        length: Math.hypot(floorPath[i + 1].x - floorPath[i].x, floorPath[i + 1].y - floorPath[i].y),
      })
    }
    return segments
  }, [floorPath])

  // Calculate total path length
  const totalLength = useMemo(() => {
    return pathSegments.reduce((sum, segment) => sum + segment.length, 0)
  }, [pathSegments])

  // Calculate distance markers positions
  const distanceMarkers = useMemo(() => {
    if (totalLength < 200 || pathSegments.length < 2) return []

    const markers = []
    let accumulatedLength = 0

    // Place a marker every 200 pixels
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]

      // Skip very short segments
      if (segment.length < 50) continue

      accumulatedLength += segment.length

      // Only add a marker if we've traveled at least 200px from the start
      if (accumulatedLength > 200 && i < pathSegments.length - 1) {
        // Calculate position at the middle of the segment
        const midX = (segment.start.x + segment.end.x) / 2
        const midY = (segment.start.y + segment.end.y) / 2

        // Calculate angle for the text
        const angle = Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x) * (180 / Math.PI)

        markers.push({
          x: midX,
          y: midY,
          distance: Math.round(accumulatedLength),
          angle,
        })

        // Reset accumulated length to avoid clustering
        accumulatedLength = 0
      }
    }

    return markers
  }, [pathSegments, totalLength])

  // Calculate animated marker position
  const animatedMarkerPosition = useMemo(() => {
    if (floorPath.length < 2 || animationProgress === 0) return null

    const targetDistance = animationProgress * totalLength
    let accumulatedDistance = 0

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]

      if (accumulatedDistance + segment.length >= targetDistance) {
        // This is the segment where our marker should be
        const segmentProgress = (targetDistance - accumulatedDistance) / segment.length
        const x = segment.start.x + (segment.end.x - segment.start.x) * segmentProgress
        const y = segment.start.y + (segment.end.y - segment.start.y) * segmentProgress

        // Calculate angle for the marker
        const angle = Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x) * (180 / Math.PI)

        return { x, y, angle }
      }

      accumulatedDistance += segment.length
    }

    return null
  }, [floorPath, animationProgress, pathSegments, totalLength])

  // Animation effect
  useEffect(() => {
    if (floorPath.length < 2) return

    // Measure the actual path length for SVG animation
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }

    // Reset animation
    setAnimationProgress(0)

    // Start animation
    let startTime: number | null = null
    const duration = 3000 // 3 seconds for full animation

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      setAnimationProgress(progress)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Restart animation after a pause
        setTimeout(() => {
          startTime = null
          animationRef.current = requestAnimationFrame(animate)
        }, 1000)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [floorPath])

  // If no path is provided, show a placeholder message
  if (path.length === 0) {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-md shadow-md z-20">
        <p className="text-sm text-center">Select source and destination to see the route.</p>
      </div>
    )
  }

  // If source or target is on this floor, highlight them
  const showSource = sourceStore?.floor === currentFloor
  const showTarget = targetStore?.floor === currentFloor

  return (
    <>
      {/* Path visualization */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
        <defs>
          {/* Gradient for the path */}
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>

          {/* Arrow marker definition */}
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>

          {/* Animated dash pattern */}
          <pattern id="dashPattern" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(0)">
            <line x1="0" y1="10" x2="20" y2="10" stroke="#60a5fa" strokeWidth="5" strokeDasharray="5,5" />
          </pattern>
        </defs>

        {floorPath.length > 1 && (
          <>
            {/* Background path */}
            <path
              d={`M ${floorPath.map((point) => `${point.x} ${point.y}`).join(" L ")}`}
              stroke="url(#routeGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />

            {/* Main path with animation */}
            <path
              ref={pathRef}
              d={`M ${floorPath.map((point) => `${point.x} ${point.y}`).join(" L ")}`}
              stroke="#3b82f6"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength * (1 - animationProgress),
                transition: "stroke-dashoffset 0.5s ease",
              }}
            />

            {/* Animated dash overlay */}
            <path
              d={`M ${floorPath.map((point) => `${point.x} ${point.y}`).join(" L ")}`}
              stroke="url(#dashPattern)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-dash"
            />
          </>
        )}

        {/* Distance markers */}
        {distanceMarkers.map((marker, index) => (
          <g key={`distance-${index}`} transform={`translate(${marker.x}, ${marker.y})`}>
            <circle r="8" fill="white" stroke="#3b82f6" strokeWidth="2" />
            <text textAnchor="middle" dominantBaseline="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">
              {Math.round(marker.distance / 100)}
            </text>
          </g>
        ))}

        {/* Animated marker */}
        {animatedMarkerPosition && (
          <g
            transform={`translate(${animatedMarkerPosition.x}, ${animatedMarkerPosition.y}) rotate(${animatedMarkerPosition.angle})`}
            className="animate-pulse"
          >
            <circle r="6" fill="#3b82f6" />
            <polygon points="-6,-6 6,0 -6,6" fill="#3b82f6" />
          </g>
        )}
      </svg>

      {/* Source marker */}
      {showSource && sourceStore && (
        <div
          className="absolute z-30 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center"
          style={{
            left: sourceStore.x + sourceStore.width / 2 - 20,
            top: sourceStore.y + sourceStore.height / 2 - 20,
            width: 40,
            height: 40,
          }}
        >
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
          <MapPin className="h-5 w-5 text-white" />
          <span className="text-white font-bold ml-1">A</span>
        </div>
      )}

      {/* Target marker */}
      {showTarget && targetStore && (
        <div
          className="absolute z-30 bg-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center"
          style={{
            left: targetStore.x + targetStore.width / 2 - 20,
            top: targetStore.y + targetStore.height / 2 - 20,
            width: 40,
            height: 40,
          }}
        >
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
          <Navigation className="h-5 w-5 text-white" />
          <span className="text-white font-bold ml-1">B</span>
        </div>
      )}

      {/* Floor transition indicators */}
      {currentFloorTransitions.map((transition, index) => {
        const isGoingUp = transition.fromFloor < transition.toFloor
        return (
          <div
            key={`transition-${index}`}
            className="absolute z-30 bg-yellow-500 rounded-full border-2 border-white shadow-md flex items-center justify-center"
            style={{
              left: transition.x - 20,
              top: transition.y - 20,
              width: 40,
              height: 40,
            }}
          >
            <div className="absolute inset-0 bg-yellow-500 rounded-full animate-pulse opacity-75"></div>
            {isGoingUp ? (
              <div className="flex flex-col items-center">
                <ArrowUp className="h-5 w-5 text-white" />
                <span className="text-white text-xs font-bold">F{transition.toFloor}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ArrowDown className="h-5 w-5 text-white" />
                <span className="text-white text-xs font-bold">F{transition.toFloor}</span>
              </div>
            )}
          </div>
        )
      })}

      {/* Direction arrows along the path */}
      {floorPath.length > 3 &&
        floorPath.slice(1, -1).map((point, index) => {
          if (index % 3 !== 0) return null // Only show arrows on some points to avoid clutter

          // Calculate direction angle
          const prevPoint = floorPath[index]
          const nextPoint = floorPath[index + 2]
          if (!prevPoint || !nextPoint) return null

          const angle = Math.atan2(nextPoint.y - prevPoint.y, nextPoint.x - prevPoint.x) * (180 / Math.PI)

          return (
            <div
              key={`arrow-${index}`}
              className="absolute z-20 bg-blue-500 rounded-full flex items-center justify-center"
              style={{
                left: point.x - 8,
                top: point.y - 8,
                width: 16,
                height: 16,
                transform: `rotate(${angle}deg)`,
              }}
            >
              <div className="w-3 h-3 border-t-2 border-r-2 border-white transform rotate-45" />
            </div>
          )
        })}

      {/* Route information panel */}
      {floorPath.length > 0 && (
        <div className="absolute top-4 right-4 bg-white/90 text-black px-4 py-2 rounded-md shadow-md z-30 text-sm">
          <div className="font-medium mb-1">Route Information</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Start: {sourceStore?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>End: {targetStore?.name}</span>
          </div>
          {path.some((p) => p.floor !== currentFloor) && (
            <div className="text-xs mt-1 text-blue-600">
              Route continues on{" "}
              {path
                .filter((p) => p.floor !== currentFloor)
                .map((p) => `Floor ${p.floor}`)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Floor indicator if route spans multiple floors */}
      {path.some((point) => point.floor !== currentFloor) && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-md z-30 flex items-center gap-2 animate-bounce-gentle">
          {currentFloor < Math.max(...path.map((p) => p.floor)) && (
            <div className="flex items-center">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>Go to Floor {currentFloor + 1}</span>
            </div>
          )}
          {currentFloor > Math.min(...path.map((p) => p.floor)) && (
            <div className="flex items-center">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span>Go to Floor {currentFloor - 1}</span>
            </div>
          )}
        </div>
      )}
    </>
  )
})
