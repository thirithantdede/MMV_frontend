"use client"

import { memo, useMemo } from "react"
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

  // OPTIMIZED: Memoize distance markers - static version
  const distanceMarkers = useMemo(() => {
    if (floorPath.length < 3) return [];

    const markers = [];
    let accumulatedDistance = 0;
    const markerInterval = 200; // Distance interval for markers

    for (let i = 0; i < floorPath.length - 1; i++) {
      const currentPoint = floorPath[i];
      const nextPoint = floorPath[i + 1];
      const segmentLength = Math.hypot(nextPoint.x - currentPoint.x, nextPoint.y - currentPoint.y);
      
      accumulatedDistance += segmentLength;

      if (accumulatedDistance >= markerInterval) {
        const midX = (currentPoint.x + nextPoint.x) * 0.5;
        const midY = (currentPoint.y + nextPoint.y) * 0.5;
        
        markers.push({
          x: midX,
          y: midY,
          distance: Math.round(accumulatedDistance),
        });

        accumulatedDistance = 0;
      }
    }

    return markers;
  }, [floorPath]);

  // OPTIMIZED: Memoize path string for SVG
  const pathString = useMemo(() => {
    if (floorPath.length < 2) return '';
    return `M ${floorPath.map((point) => `${point.x} ${point.y}`).join(" L ")}`;
  }, [floorPath]);

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
      {/* OPTIMIZED: Path visualization without animations */}
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
            {/* Static background path */}
            <path
              d={pathString}
              stroke="url(#routeGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />

            {/* Static main path */}
            <path
              d={pathString}
              stroke="#3b82f6"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
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
          />
        )}

        {/* Static markers at each path point */}
        {floorPath.length > 1 && floorPath.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Static distance markers */}
        {distanceMarkers.map((marker, index) => (
          <g key={`distance-${index}`} transform={`translate(${marker.x}, ${marker.y})`}>
            <circle r="12" fill="white" stroke="#3b82f6" strokeWidth="2" />
            <text 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="#3b82f6" 
              fontSize="10" 
              fontWeight="bold"
            >
              {Math.round(marker.distance)}
            </text>
          </g>
        ))}
      </svg>

      {/* Static source marker */}
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
          <MapPin className="h-5 w-5 text-white" />
          <span className="text-white font-bold ml-1">A</span>
        </div>
      )}

      {/* Static target marker */}
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
          <Navigation className="h-5 w-5 text-white" />
          <span className="text-white font-bold ml-1">B</span>
        </div>
      )}

      {/* Static floor transition indicators */}
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
    </>
  );
});


      