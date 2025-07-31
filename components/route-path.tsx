"use client"

import { memo, useMemo, useEffect, useState, useRef, useCallback } from "react"
import { ArrowUp, ArrowDown, Navigation, MapPin } from "lucide-react"
import type { RouteInfo, MapSettings } from "@/types"
import { getPathStatistics } from "@/utils/pathfinding"

interface RoutePathProps {
  routeInfo: RouteInfo
  currentFloor: number
  mapSettings?: MapSettings
}

export const RoutePath = memo(function RoutePath({ routeInfo, currentFloor, mapSettings }: RoutePathProps) {
  const { sourceStore, targetStore, path } = routeInfo
  const [animationProgress, setAnimationProgress] = useState(0)
  const animationRef = useRef<number | null>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)

  // OPTIMIZED: Memoize floor path calculation with better performance
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

  // OPTIMIZED: Memoize floor transitions calculation
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

  // OPTIMIZED: Memoize current floor transitions
  const currentFloorTransitions = useMemo(() => {
    return floorTransitions.filter((transition) => transition.fromFloor === currentFloor)
  }, [floorTransitions, currentFloor])

  // OPTIMIZED: Memoize path segments calculation with reduced complexity
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

  // OPTIMIZED: Memoize total path length
  const totalLength = useMemo(() => {
    return pathSegments.reduce((sum, segment) => sum + segment.length, 0)
  }, [pathSegments])

  // OPTIMIZED: Memoize path statistics using the utility function
  const pathStats = useMemo(() => {
    if (!mapSettings || path.length === 0) {
      return {
        totalDistance: 0,
        walkingTime: 0,
        transitionCount: 0,
        floors: []
      };
    }
    return getPathStatistics(path, mapSettings);
  }, [path, mapSettings]);

  // OPTIMIZED: Memoize distance markers with reduced calculations and higher threshold
  const distanceMarkers = useMemo(() => {
    if (totalLength < 300 || pathSegments.length < 3) return [] // Increased threshold

    const markers = []
    let accumulatedLength = 0
    const markerInterval = 300; // Increased interval for better performance

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]

      if (segment.length < 80) continue // Increased minimum segment length

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

  // OPTIMIZED: Memoize animated marker position with reduced frequency
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

  // OPTIMIZED: Memoize path string for SVG
  const pathString = useMemo(() => {
    if (floorPath.length < 2) return '';
    return `M ${floorPath.map((point) => `${point.x} ${point.y}`).join(" L ")}`;
  }, [floorPath]);

  // OPTIMIZED: Simplified animation with reduced frequency
  const startAnimation = useCallback(() => {
    if (floorPath.length < 2) return;

    // Measure path length once
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }

    setAnimationProgress(0);

    let startTime: number | null = null;
    const duration = 5000; // Increased duration for smoother, less frequent updates

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // OPTIMIZED: Update progress less frequently for better performance
      setAnimationProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Restart animation after a longer pause
        setTimeout(() => {
          startTime = null;
          animationRef.current = requestAnimationFrame(animate);
        }, 2000); // Increased pause time
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [floorPath.length]);

  // OPTIMIZED: Effect for animation with cleanup
  useEffect(() => {
    startAnimation();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [startAnimation]);

  // OPTIMIZED: Memoize route info
  const isMultiFloorRoute = useMemo(() => {
    return path.some(point => point.floor !== path[0]?.floor);
  }, [path]);

  const showSource = useMemo(() => sourceStore?.floor === currentFloor, [sourceStore?.floor, currentFloor]);
  const showTarget = useMemo(() => targetStore?.floor === currentFloor, [targetStore?.floor, currentFloor]);

  // OPTIMIZED: Memoize next floor direction calculation
  const nextFloorDirection = useMemo(() => {
    if (!isMultiFloorRoute) return null;
    
    const currentFloorIndex = path.findIndex(point => point.floor === currentFloor);
    if (currentFloorIndex === -1) return null;
    
    // Find the next floor transition
    for (let i = currentFloorIndex; i < path.length - 1; i++) {
      if (path[i].floor !== path[i + 1].floor) {
        return {
          direction: path[i + 1].floor > path[i].floor ? 'up' : 'down',
          targetFloor: path[i + 1].floor
        };
      }
    }
    
    return null;
  }, [path, currentFloor, isMultiFloorRoute]);

  // OPTIMIZED: Early return for empty path
  if (path.length === 0) {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-md shadow-md z-20">
        <p className="text-sm text-center">Select source and destination to see the route.</p>
      </div>
    );
  }

  return (
    <>
      {/* OPTIMIZED: Path visualization with reduced complexity */}
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
            {/* OPTIMIZED: Simplified background path */}
            <path
              d={pathString}
              stroke="url(#routeGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />

            {/* OPTIMIZED: Main path with simplified animation */}
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
                transition: "stroke-dashoffset 0.2s ease", // Increased transition time
              }}
            />

            {/* OPTIMIZED: Simplified dash overlay with reduced animation */}
            <path
              d={pathString}
              stroke="#60a5fa"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8,8" // Increased dash size
              style={{
                animation: "dash 2s linear infinite", // Slower animation
              }}
            />
          </>
        )}

        {/* OPTIMIZED: Show single point if we only have one point on this floor */}
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

        {/* OPTIMIZED: Distance markers - only render if there are any */}
        {distanceMarkers.map((marker, index) => (
          <g key={index} transform={`translate(${marker.x}, ${marker.y})`}>
            <circle r="8" fill="white" stroke="#3b82f6" strokeWidth="2" />
            <text textAnchor="middle" dominantBaseline="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">
              {Math.round(marker.distance / 100)}
            </text>
          </g>
        ))}

        {/* OPTIMIZED: Animated marker with reduced frequency */}
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

      {/* OPTIMIZED: Source marker with reduced animation */}
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
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-50"></div> {/* Reduced opacity */}
          <MapPin className="h-5 w-5 text-white" />
          <span className="text-white font-bold ml-1">A</span>
        </div>
      )}

      {/* OPTIMIZED: Target marker with reduced animation */}
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
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-50"></div> {/* Reduced opacity */}
          <Navigation className="h-5 w-5 text-white" />
          <span className="text-white font-bold ml-1">B</span>
        </div>
      )}

      {/* OPTIMIZED: Floor transition indicators with reduced animation */}
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
            <div className="absolute inset-0 bg-yellow-500 rounded-full animate-pulse opacity-50"></div> {/* Reduced opacity */}
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

      {/* OPTIMIZED: Direction arrows - significantly reduced frequency */}
      {floorPath.length > 6 &&
        floorPath.slice(1, -1).filter((_, index) => index % 8 === 0).map((point, index) => { // Increased filter interval
          const actualIndex = (index * 8) + 1; // Increased multiplier
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

      {/* OPTIMIZED: CSS animations with reduced complexity */}
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -16; /* Adjusted for larger dash size */
          }
        }
      `}</style>
    </>
  );
});


      