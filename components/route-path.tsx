"use client"

import { memo, useMemo, useEffect, useState, useRef, useCallback } from "react"
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

  // Memoize floor path calculation with better performance
  const floorPath = useMemo(() => {
    if (path.length === 0) return [];
    
    // Get all points that are on the current floor
    const currentFloorPoints = path.filter((point) => point.floor === currentFloor);
    
    // If we have enough points on this floor, return them
    if (currentFloorPoints.length >= 2) {
      return currentFloorPoints;
    }
    
    // Look for transition points that connect to this floor
    const transitionPoints = [];
    for (let i = 0; i < path.length - 1; i++) {
      const currentPoint = path[i];
      const nextPoint = path[i + 1];
      
      // If there's a floor transition
      if (currentPoint.floor !== nextPoint.floor) {
        // If current point is on our floor, include it
        if (currentPoint.floor === currentFloor) {
          transitionPoints.push(currentPoint);
        }
        // If next point is on our floor, include it
        if (nextPoint.floor === currentFloor) {
          transitionPoints.push(nextPoint);
        }
      }
    }
    
    // Combine current floor points with transition points
    const allRelevantPoints = [...currentFloorPoints, ...transitionPoints];
    
    // Remove duplicates using a Set with string keys for better performance
    const seen = new Set<string>();
    const uniquePoints = allRelevantPoints.filter(point => {
      const key = `${point.x},${point.y},${point.floor}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Sort by order in original path
    uniquePoints.sort((a, b) => path.indexOf(a) - path.indexOf(b));
    
    return uniquePoints;
  }, [path, currentFloor])

  // Memoize floor transitions calculation
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

  // Memoize current floor transitions
  const currentFloorTransitions = useMemo(() => {
    return floorTransitions.filter((transition) => transition.fromFloor === currentFloor)
  }, [floorTransitions, currentFloor])

  // Memoize path segments calculation
  const pathSegments = useMemo(() => {
    if (floorPath.length < 2) return []

    const segments = []
    for (let i = 0; i < floorPath.length - 1; i++) {
      const start = floorPath[i];
      const end = floorPath[i + 1];
      segments.push({
        start,
        end,
        length: Math.hypot(end.x - start.x, end.y - start.y),
      })
    }
    return segments
  }, [floorPath])

  // Memoize total path length
  const totalLength = useMemo(() => {
    return pathSegments.reduce((sum, segment) => sum + segment.length, 0)
  }, [pathSegments])

  // Memoize distance markers with reduced calculations
  const distanceMarkers = useMemo(() => {
    if (totalLength < 200 || pathSegments.length < 2) return []

    const markers = []
    let accumulatedLength = 0
    const markerInterval = 200; // pixels

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]

      if (segment.length < 50) continue

      accumulatedLength += segment.length

      if (accumulatedLength > markerInterval && i < pathSegments.length - 1) {
        const midX = (segment.start.x + segment.end.x) * 0.5;
        const midY = (segment.start.y + segment.end.y) * 0.5;
        const angle = Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x) * (180 / Math.PI);

        markers.push({
          x: midX,
          y: midY,
          distance: Math.round(accumulatedLength),
          angle,
        })

        accumulatedLength = 0
      }
    }

    return markers
  }, [pathSegments, totalLength])

  // Memoize animated marker position
  const animatedMarkerPosition = useMemo(() => {
    if (floorPath.length < 2 || animationProgress === 0) return null

    const targetDistance = animationProgress * totalLength
    let accumulatedDistance = 0

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]

      if (accumulatedDistance + segment.length >= targetDistance) {
        const segmentProgress = (targetDistance - accumulatedDistance) / segment.length
        const x = segment.start.x + (segment.end.x - segment.start.x) * segmentProgress
        const y = segment.start.y + (segment.end.y - segment.start.y) * segmentProgress
        const angle = Math.atan2(segment.end.y - segment.start.y, segment.end.x - segment.start.x) * (180 / Math.PI)

        return { x, y, angle }
      }

      accumulatedDistance += segment.length
    }

    return null
  }, [floorPath, animationProgress, pathSegments, totalLength])

  // Memoize path string for SVG
  const pathString = useMemo(() => {
    if (floorPath.length < 2) return '';
    return `M ${floorPath.map((point) => `${point.x} ${point.y}`).join(" L ")}`;
  }, [floorPath]);

  // Optimized animation with requestAnimationFrame
  const startAnimation = useCallback(() => {
    if (floorPath.length < 2) return;

    // Measure path length once
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }

    setAnimationProgress(0);

    let startTime: number | null = null;
    const duration = 3000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimationProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Restart animation after a pause
        setTimeout(() => {
          startTime = null;
          animationRef.current = requestAnimationFrame(animate);
        }, 1000);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [floorPath.length]);

  // Effect for animation with cleanup
  useEffect(() => {
    startAnimation();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [startAnimation]);

  // Memoize route info
  const isMultiFloorRoute = useMemo(() => {
    return path.some(point => point.floor !== path[0]?.floor);
  }, [path]);

  const showSource = useMemo(() => sourceStore?.floor === currentFloor, [sourceStore?.floor, currentFloor]);
  const showTarget = useMemo(() => targetStore?.floor === currentFloor, [targetStore?.floor, currentFloor]);

  // Memoize next floor direction calculation
  const nextFloorDirection = useMemo(() => {
    if (!isMultiFloorRoute) return null;
    
    const allFloors = [...new Set(path.map(p => p.floor))].sort((a, b) => a - b);
    const currentFloorIndex = allFloors.indexOf(currentFloor);
    
    if (currentFloorIndex === -1) return null;
    
    if (sourceStore?.floor === currentFloor && targetStore?.floor !== currentFloor) {
          return targetStore.floor > currentFloor ? 'up' : 'down';
    }
    
    if (currentFloorIndex < allFloors.length - 1) {
      const nextFloor = allFloors[currentFloorIndex + 1];
      return nextFloor > currentFloor ? 'up' : 'down';
    }
    
    return null;
  }, [isMultiFloorRoute, path, currentFloor, sourceStore?.floor, targetStore?.floor]);

  // Early return for empty path
  if (path.length === 0) {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-md shadow-md z-20">
        <p className="text-sm text-center">Select source and destination to see the route.</p>
      </div>
    );
  }

  return (
    <>
      {/* Path visualization */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
        </defs>

        {floorPath.length > 1 && (
          <>
            {/* Background path */}
            <path
              d={pathString}
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
              d={pathString}
              stroke="#3b82f6"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength * (1 - animationProgress),
                transition: "stroke-dashoffset 0.1s ease",
              }}
            />

            {/* Animated dash overlay */}
            <path
              d={pathString}
              stroke="#60a5fa"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5,5"
              style={{
                animation: "dash 1s linear infinite",
              }}
            />
          </>
        )}

        {/* Show single point if we only have one point on this floor */}
        {floorPath.length === 1 && (
          <circle
            cx={floorPath[0].x}
            cy={floorPath[0].y}
            r="8"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
            className="animate-pulse"
          />
        )}

        {/* Distance markers - only render if there are any */}
        {distanceMarkers.map((marker, index) => (
          <g key={index} transform={`translate(${marker.x}, ${marker.y})`}>
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
        const isGoingUp = transition.fromFloor < transition.toFloor;
        return (
          <div
            key={index}
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
        );
      })}

      {/* Optimized direction arrows - reduce frequency */}
      {floorPath.length > 4 &&
        floorPath.slice(1, -1).filter((_, index) => index % 4 === 0).map((point, index) => {
          const actualIndex = (index * 4) + 1;
          const prevPoint = floorPath[actualIndex - 1];
          const nextPoint = floorPath[actualIndex + 1];
          if (!prevPoint || !nextPoint) return null;

          const angle = Math.atan2(nextPoint.y - prevPoint.y, nextPoint.x - prevPoint.x) * (180 / Math.PI);

          return (
            <div
              key={index}
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
          );
        })}

      {/* Route information panel */}
      {(floorPath.length > 0 || isMultiFloorRoute) && (
        <div className="absolute top-4 right-4 bg-white/90 text-black px-4 py-2 rounded-md shadow-md z-30 text-sm">
          <div className="font-medium mb-1">Route Information</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Start: {sourceStore?.name} (Floor {sourceStore?.floor})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>End: {targetStore?.name} (Floor {targetStore?.floor})</span>
          </div>
          {isMultiFloorRoute && (
            <div className="text-xs mt-1 text-blue-600">
              Multi-floor route: {[...new Set(path.map(p => p.floor))].sort((a, b) => a - b).map(f => `Floor ${f}`).join(" → ")}
            </div>
          )}
          {currentFloorTransitions.length > 0 && (
            <div className="text-xs mt-1 text-yellow-600">
              Use transition elements to change floors
            </div>
          )}
          {floorPath.length === 0 && isMultiFloorRoute && (
            <div className="text-xs mt-1 text-gray-600">
              No path on current floor - use transitions to navigate
            </div>
          )}
        </div>
      )}

      {/* Enhanced floor navigation indicator for multi-floor routes */}
      {isMultiFloorRoute && nextFloorDirection && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg z-30 flex items-center gap-3">
          {nextFloorDirection === 'up' && (
            <div className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 animate-bounce" />
              <div className="text-center">
                <div className="text-sm font-medium">Go Up</div>
                <div className="text-xs opacity-90">
                  {sourceStore?.floor === currentFloor 
                    ? `To Floor ${targetStore?.floor}` 
                    : `Continue to next floor`}
                </div>
              </div>
            </div>
          )}
          {nextFloorDirection === 'down' && (
            <div className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 animate-bounce" />
              <div className="text-center">
                <div className="text-sm font-medium">Go Down</div>
                <div className="text-xs opacity-90">
                  {sourceStore?.floor === currentFloor 
                    ? `To Floor ${targetStore?.floor}` 
                    : `Continue to next floor`}
                </div>
              </div>
            </div>
          )}
          {!nextFloorDirection && targetStore?.floor === currentFloor && (
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              <div className="text-center">
                <div className="text-sm font-medium">Final Floor</div>
                <div className="text-xs opacity-90">Follow path to destination</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current floor status for multi-floor routes */}
      {isMultiFloorRoute && (
        <div className="absolute top-20 left-4 bg-white/90 text-black px-3 py-2 rounded-md shadow-md z-30 text-sm">
          <div className="font-medium">Current Floor: {currentFloor}</div>
          <div className="text-xs text-gray-600">
            {sourceStore?.floor === currentFloor && "Starting floor"}
            {targetStore?.floor === currentFloor && "Destination floor"}
            {sourceStore?.floor !== currentFloor && targetStore?.floor !== currentFloor && "Transit floor"}
          </div>
          {floorPath.length > 0 && (
            <div className="text-xs text-green-600 mt-1">
              Path available on this floor
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </>
  );
});


      