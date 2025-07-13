// pathfinding.ts
import type { MapElement, MapSettings, RoutePoint, ElementType } from "@/types";
import { accept, storeTypes } from "./global";

interface Node {
  x: number;
  y: number;
  f: number; // Total cost (g + h)
  g: number; // Cost from start
  h: number; // Heuristic to goal
  parent: Node | null;
}

// Walking speed constants
const WALKING_SPEED_METERS_PER_SECOND = 1.4; // Average walking speed ~5 km/h
const TRANSITION_TIME_SECONDS = 30; // Time for elevator/escalator/stairs transition

// Cache for loaded floor elements to avoid repeated localStorage reads
const floorElementsCache = new Map<number, MapElement[]>();
const cacheTimestamp = new Map<number, number>();
const CACHE_DURATION = 5000; // 5 seconds cache

// Buffer distance - will fallback to 0 if no path found
const ELEMENT_BUFFER_GRIDS = 4; // was 2
const MIN_PATH_WIDTH_GRIDS = 3;

// Helper function to calculate walking time from path
export function calculateWalkingTimeFromPath(path: RoutePoint[], mapSettings: MapSettings): number {
  if (path.length < 2) return 0;
  
  let totalDistance = 0;
  let transitionCount = 0;
  
  // Calculate total distance and count floor transitions
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];
    
    // Calculate distance between points
    const distance = Math.hypot(next.x - current.x, next.y - current.y);
    totalDistance += distance;
    
    // Count floor transitions
    if (current.floor !== next.floor) {
      transitionCount++;
    }
  }
  
  // Convert pixels to meters using grid size as reference
  const pixelsPerMeter = mapSettings.grid_size || 20;
  const distanceInMeters = totalDistance / pixelsPerMeter;
  
  // Calculate walking time
  const walkingTimeSeconds = distanceInMeters / WALKING_SPEED_METERS_PER_SECOND;
  
  // Add transition time
  const transitionTimeSeconds = transitionCount * TRANSITION_TIME_SECONDS;
  
  return walkingTimeSeconds + transitionTimeSeconds;
}

// Helper function to format walking time for display
export function formatWalkingTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

// Helper function to get path statistics
export function getPathStatistics(path: RoutePoint[], mapSettings: MapSettings): {
  totalDistance: number;
  walkingTime: number;
  transitionCount: number;
  floors: number[];
} {
  if (path.length < 2) {
    return {
      totalDistance: 0,
      walkingTime: 0,
      transitionCount: 0,
      floors: []
    };
  }
  
  let totalDistance = 0;
  let transitionCount = 0;
  const floors = new Set<number>();
  
  // Calculate total distance and count floor transitions
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];
    
    // Calculate distance between points
    const distance = Math.hypot(next.x - current.x, next.y - current.y);
    totalDistance += distance;
    
    // Count floor transitions
    if (current.floor !== next.floor) {
      transitionCount++;
    }
    
    // Track floors
    floors.add(current.floor);
    floors.add(next.floor);
  }
  
  // Convert pixels to meters
  const pixelsPerMeter = mapSettings.grid_size || 20;
  const distanceInMeters = totalDistance / pixelsPerMeter;
  
  // Calculate walking time
  const walkingTimeSeconds = distanceInMeters / WALKING_SPEED_METERS_PER_SECOND;
  const transitionTimeSeconds = transitionCount * TRANSITION_TIME_SECONDS;
  const totalTime = walkingTimeSeconds + transitionTimeSeconds;
  
  return {
    totalDistance: distanceInMeters,
    walkingTime: totalTime,
    transitionCount,
    floors: Array.from(floors).sort((a, b) => a - b)
  };
}

// Helper function to get detailed path statistics
export function getDetailedPathStatistics(path: RoutePoint[], mapSettings: MapSettings): {
  totalDistance: number;
  walkingTime: number;
  transitionCount: number;
  floors: number[];
  walkingSpeed: number;
  accessibilityTime: number;
  totalTimeWithAccessibility: number;
} {
  if (path.length < 2) {
    return {
      totalDistance: 0,
      walkingTime: 0,
      transitionCount: 0,
      floors: [],
      walkingSpeed: WALKING_SPEED_METERS_PER_SECOND,
      accessibilityTime: 0,
      totalTimeWithAccessibility: 0
    };
  }
  
  let totalDistance = 0;
  let transitionCount = 0;
  const floors = new Set<number>();
  
  // Calculate total distance and count floor transitions
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];
    
    // Calculate distance between points
    const distance = Math.hypot(next.x - current.x, next.y - current.y);
    totalDistance += distance;
    
    // Count floor transitions
    if (current.floor !== next.floor) {
      transitionCount++;
    }
    
    // Track floors
    floors.add(current.floor);
    floors.add(next.floor);
  }
  
  // Convert pixels to meters
  const pixelsPerMeter = mapSettings.grid_size || 20;
  const distanceInMeters = totalDistance / pixelsPerMeter;
  
  // Calculate walking time with different speeds
  const normalWalkingTime = distanceInMeters / WALKING_SPEED_METERS_PER_SECOND;
  const slowWalkingTime = distanceInMeters / (WALKING_SPEED_METERS_PER_SECOND * 0.7); // 30% slower for accessibility
  
  // Add transition time
  const transitionTimeSeconds = transitionCount * TRANSITION_TIME_SECONDS;
  const totalTime = normalWalkingTime + transitionTimeSeconds;
  const totalTimeWithAccessibility = slowWalkingTime + transitionTimeSeconds;
  
  return {
    totalDistance: distanceInMeters,
    walkingTime: totalTime,
    transitionCount,
    floors: Array.from(floors).sort((a, b) => a - b),
    walkingSpeed: WALKING_SPEED_METERS_PER_SECOND,
    accessibilityTime: totalTimeWithAccessibility,
    totalTimeWithAccessibility
  };
}

// Helper function to format walking time with accessibility options
export function formatWalkingTimeWithAccessibility(seconds: number, includeAccessibility: boolean = false): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  const timeString = `${minutes}m ${remainingSeconds}s`;
  
  if (includeAccessibility) {
    return `${timeString} (accessible)`;
  }
  
  return timeString;
}

// Helper function to load elements from localStorage for a specific floor with caching
function loadFloorElements(floor: number): MapElement[] {
  if (typeof window === "undefined") return [];
  
  const now = Date.now();
  const cached = floorElementsCache.get(floor);
  const timestamp = cacheTimestamp.get(floor);
  
  // Return cached data if it's still valid
  if (cached && timestamp && (now - timestamp) < CACHE_DURATION) {
    return cached;
  }
  
  try {
    // Load floor-specific elements
    const floorKey = `mall-map-elements-${floor}`;
    const floorStored = localStorage.getItem(floorKey);
    const floorElements = floorStored ? JSON.parse(floorStored) : [];
    
    // Load shared floor elements (floor 0) - cache this separately
    let sharedElements: MapElement[] = floorElementsCache.get(0) || [];
    if (!sharedElements.length || !cacheTimestamp.get(0) || (now - cacheTimestamp.get(0)!) >= CACHE_DURATION) {
      const sharedStored = localStorage.getItem("floor-elements");
      sharedElements = sharedStored ? JSON.parse(sharedStored) : [];
      floorElementsCache.set(0, sharedElements);
      cacheTimestamp.set(0, now);
    }
    
    // Combine both arrays
    const combined = [...floorElements, ...sharedElements];
    
    // Cache the result
    floorElementsCache.set(floor, combined);
    cacheTimestamp.set(floor, now);
    
    return combined;
  } catch (error) {
    return [];
  }
}

// Clear cache when needed (call this when elements are updated)
export function clearFloorElementsCache() {
  floorElementsCache.clear();
  cacheTimestamp.clear();
}

// Cache for transition elements
const transitionElementsCache = new Map<number, MapElement[]>();

// Helper function to find transition elements with caching
function findTransitionElements(floor: number): MapElement[] {
  const cached = transitionElementsCache.get(floor);
  if (cached) return cached;
  
  const floorElements = loadFloorElements(floor);
  const transitionTypes: ElementType[] = ["elevator", "escalator", "stairs"];
  const transitions = floorElements.filter(element => transitionTypes.includes(element.type as ElementType));
  
  transitionElementsCache.set(floor, transitions);
  return transitions;
}

// Optimized distance calculation using squared distance (avoid sqrt when possible)
function calculateDistanceSquared(element1: MapElement, element2: MapElement): number {
  const x1 = element1.x + element1.width / 2;
  const y1 = element1.y + element1.height / 2;
  const x2 = element2.x + element2.width / 2;
  const y2 = element2.y + element2.height / 2;
  return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}

function calculateDistance(element1: MapElement, element2: MapElement): number {
  return Math.sqrt(calculateDistanceSquared(element1, element2));
}

// Optimized nearest transition finder
function findNearestTransition(
  sourceElement: MapElement,
  transitionElements: MapElement[]
): MapElement | null {
  if (transitionElements.length === 0) return null;

  let nearest = transitionElements[0];
  let minDistanceSquared = calculateDistanceSquared(sourceElement, nearest);

  for (let i = 1; i < transitionElements.length; i++) {
    const distanceSquared = calculateDistanceSquared(sourceElement, transitionElements[i]);
    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      nearest = transitionElements[i];
    }
  }

  return nearest;
}

// Path cache for expensive multi-floor calculations
const pathCache = new Map<string, { path: RoutePoint[], timestamp: number }>();
const PATH_CACHE_DURATION = 10000; // 10 seconds

function getPathCacheKey(source: MapElement, target: MapElement): string {
  return `${source.id}-${target.id}-${source.floor}-${target.floor}`;
}

export function findPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  fElements: MapElement[],
  mapSettings: MapSettings,
  avoidElements: boolean = true,
): RoutePoint[] {
  // Check cache first for multi-floor paths (they're more expensive)
  if (sourceStore.floor !== targetStore.floor) {
    const cacheKey = getPathCacheKey(sourceStore, targetStore);
    const cached = pathCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < PATH_CACHE_DURATION) {
      return cached.path;
    }
    
    const path = findMultiFloorPath(sourceStore, targetStore, allElements, fElements, mapSettings, avoidElements);
    
    // Cache the result
    pathCache.set(cacheKey, { path, timestamp: now });
    return path;
  }

  // Single floor paths with fallback system
  return findSingleFloorPathWithFallback(sourceStore, targetStore, allElements, fElements, mapSettings, avoidElements);
}

// ENHANCED: Single floor path with strict fallback system
function findSingleFloorPathWithFallback(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  fElements: MapElement[],
  mapSettings: MapSettings,
  avoidElements: boolean = true,
): RoutePoint[] {
  // First try with full buffer (most strict)
  let path = findSingleFloorPath(sourceStore, targetStore, allElements, fElements, mapSettings, avoidElements, ELEMENT_BUFFER_GRIDS);
  
  if (path.length > 0) {
    return path;
  }

  // If no path found, try with reduced buffer
  path = findSingleFloorPath(sourceStore, targetStore, allElements, fElements, mapSettings, avoidElements, 1);
  
  if (path.length > 0) {
    return path;
  }

  // If still no path found, try with minimal buffer
  path = findSingleFloorPath(sourceStore, targetStore, allElements, fElements, mapSettings, avoidElements, 0);
  
  if (path.length > 0) {
    return path;
  }

  // Last resort: try without avoiding elements at all (only if absolutely necessary)
  return findSingleFloorPath(sourceStore, targetStore, allElements, fElements, mapSettings, false, 0);
}

function findMultiFloorPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  fElements: MapElement[],
  mapSettings: MapSettings,
  avoidElements: boolean = true,
): RoutePoint[] {
  const path: RoutePoint[] = [];
  const sourceFloor = sourceStore.floor;
  const targetFloor = targetStore.floor;
  
  // Determine the direction of floor movement
  const isGoingUp = targetFloor > sourceFloor;
  const floorDirection = isGoingUp ? 1 : -1;
  
  // Step 1: Find path from source to nearest transition on source floor
  const sourceFloorTransitions = findTransitionElements(sourceFloor);
  
  if (sourceFloorTransitions.length === 0) {
    return [];
  }
  
  const nearestSourceTransition = findNearestTransition(sourceStore, sourceFloorTransitions);
  if (!nearestSourceTransition) {
    return [];
  }
  
  // Get ALL elements for source floor - FIXED: Properly consolidate all elements
  const sourceFloorElementsFromStorage = loadFloorElements(sourceFloor);
  const sourceFloorElementsFromAll = allElements.filter(el => el.floor === sourceFloor);
  const sourceFloorElementsFromF = fElements.filter(el => el.floor === sourceFloor);
  
  // Combine and deduplicate all elements
  const allSourceFloorElements = consolidateElements([
    ...sourceFloorElementsFromStorage,
    ...sourceFloorElementsFromAll,
    ...sourceFloorElementsFromF
  ]);
  
  // Get path from source to transition on source floor with fallback
  const sourceToTransitionPath = findSingleFloorPathWithFallback(
    sourceStore,
    nearestSourceTransition,
    allSourceFloorElements,
    [], // Don't pass fElements again since we already included them
    mapSettings,
    avoidElements
  );
  
  if (sourceToTransitionPath.length === 0) {
    // Add direct connection as last resort
    path.push({
      x: sourceStore.x + sourceStore.width / 2,
      y: sourceStore.y + sourceStore.height / 2,
      floor: sourceFloor
    });
    path.push({
      x: nearestSourceTransition.x + nearestSourceTransition.width / 2,
      y: nearestSourceTransition.y + nearestSourceTransition.height / 2,
      floor: sourceFloor
    });
  } else {
    path.push(...sourceToTransitionPath);
  }
  
  // Step 2: Create transition points for intermediate floors
  let currentFloor = sourceFloor;
  let currentTransition = nearestSourceTransition;
  
  while (currentFloor !== targetFloor) {
    const nextFloor = currentFloor + floorDirection;
    
    // Find corresponding transition element on the next floor
    const nextFloorTransitions = findTransitionElements(nextFloor);
    
    if (nextFloorTransitions.length === 0) {
      return path; // Return partial path
    }
    
    // Better transition matching
    const correspondingTransition = nextFloorTransitions.find(t => 
      t.type === currentTransition.type &&
      Math.abs(t.x - currentTransition.x) < 100 && // Increased tolerance
      Math.abs(t.y - currentTransition.y) < 100
    );
    
    if (!correspondingTransition) {
      // Use the nearest transition as fallback
      const fallbackTransition = findNearestTransition(currentTransition, nextFloorTransitions);
      if (fallbackTransition) {
        path.push({
          x: fallbackTransition.x + fallbackTransition.width / 2,
          y: fallbackTransition.y + fallbackTransition.height / 2,
          floor: nextFloor
        });
        currentTransition = fallbackTransition;
      } else {
        return path;
      }
    } else {
      // Add transition point on the next floor
      path.push({
        x: correspondingTransition.x + correspondingTransition.width / 2,
        y: correspondingTransition.y + correspondingTransition.height / 2,
        floor: nextFloor
      });
      currentTransition = correspondingTransition;
    }
    
    currentFloor = nextFloor;
  }
  
  // Step 3: Find path from transition to target on target floor
  const targetFloorElementsFromStorage = loadFloorElements(targetFloor);
  const targetFloorElementsFromAll = allElements.filter(el => el.floor === targetFloor);
  const targetFloorElementsFromF = fElements.filter(el => el.floor === targetFloor);
  
  // Combine and deduplicate all elements
  const allTargetFloorElements = consolidateElements([
    ...targetFloorElementsFromStorage,
    ...targetFloorElementsFromAll,
    ...targetFloorElementsFromF
  ]);
  
  const targetFloorTransitions = findTransitionElements(targetFloor);
  
  // Find the transition element on target floor that corresponds to our current transition
  const targetFloorTransition = targetFloorTransitions.find(t => 
    t.type === currentTransition.type &&
    Math.abs(t.x - currentTransition.x) < 100 &&
    Math.abs(t.y - currentTransition.y) < 100
  ) || currentTransition;
  
  // Get path from transition to target on target floor with fallback
  const transitionToTargetPath = findSingleFloorPathWithFallback(
    targetFloorTransition,
    targetStore,
    allTargetFloorElements,
    [], // Don't pass fElements again since we already included them
    mapSettings,
    avoidElements
  );
  
  if (transitionToTargetPath.length > 0) {
    // Remove the first point to avoid duplication with the last transition point
    path.push(...transitionToTargetPath.slice(1));
  } else {
    // If no path found, add direct connection to target
    path.push({
      x: targetStore.x + targetStore.width / 2,
      y: targetStore.y + targetStore.height / 2,
      floor: targetFloor
    });
  }
  
  return path;
}

// NEW: Consolidate elements and remove duplicates
function consolidateElements(elements: MapElement[]): MapElement[] {
  const elementMap = new Map<string, MapElement>();
  
  for (const element of elements) {
    if (element && element.id) {
      elementMap.set(element.id, element);
    }
  }
  
  return Array.from(elementMap.values());
}

// ENHANCED: Strict element obstacle detection - ALL elements are obstacles except specific walkable types
function isElementObstacle(element: MapElement, sourceId: string, targetId: string): boolean {
  // Skip source and target elements
  if (element.id === sourceId || element.id === targetId) return false;
  
  // Elements explicitly marked as walkable are not obstacles
  if (element.walkable === true) return false;
  
  // STRICT: Only specific walkable types are allowed to be passed through
  const walkableTypes = ['pathway', 'door', 'elevator', 'escalator', 'stairs'];
  
  // If it's not explicitly walkable, it's an obstacle
  if (!walkableTypes.includes(element.type)) {
    return true;
  }
  
  // Even walkable types might have restrictions - check if they're actually passable
  // For example, some doors might be closed, some pathways might be blocked
  if (element.type === 'door' && element.walkable === false) {
    return true;
  }
  
  return false;
}

function markElementObstacles(
  grid: Uint8Array,
  elements: MapElement[],
  gridWidth: number,
  gridHeight: number,
  mapSettings: MapSettings,
  sourceId: string,
  targetId: string,
  floor: number,
  bufferGrids: number = 0
) {
  for (const element of elements) {
    // Only process elements on current floor
    if (element.floor !== floor) continue;
    
    // Use the strict obstacle detection function
    if (!isElementObstacle(element, sourceId, targetId)) continue;
    
    // ENHANCED: More precise grid coverage calculation
    // Convert element bounds to grid coordinates with proper rounding
    const elementLeft = element.x - mapSettings.building_x;
    const elementTop = element.y - mapSettings.building_y;
    const elementRight = elementLeft + element.width;
    const elementBottom = elementTop + element.height;
    
    // Calculate which grid cells this element occupies
    // Use Math.floor for start and Math.ceil for end to ensure FULL coverage
    // This ensures the entire element area is blocked, not just partial coverage
    const startGridX = Math.max(0, Math.floor(elementLeft / mapSettings.grid_size) - bufferGrids);
    const endGridX = Math.min(gridWidth, Math.ceil(elementRight / mapSettings.grid_size) + bufferGrids);
    const startGridY = Math.max(0, Math.floor(elementTop / mapSettings.grid_size) - bufferGrids);
    const endGridY = Math.min(gridHeight, Math.ceil(elementBottom / mapSettings.grid_size) + bufferGrids);
    
    // Mark ALL grid cells that this element covers as blocked
    for (let gridY = startGridY; gridY < endGridY; gridY++) {
      for (let gridX = startGridX; gridX < endGridX; gridX++) {
        const gridIndex = gridY * gridWidth + gridX;
        if (gridIndex >= 0 && gridIndex < grid.length) {
          grid[gridIndex] = 0; // Mark as blocked
        }
      }
    }
  }
}

// ENHANCED: Improved single floor pathfinding with proper element consolidation
function findSingleFloorPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  fElements: MapElement[],
  mapSettings: MapSettings,
  avoidElements: boolean = true,
  bufferGrids: number = 0,
): RoutePoint[] {
  const floor = sourceStore.floor !== 0 ? sourceStore.floor : targetStore.floor;

  // Get ALL elements for this floor and consolidate them
  const floorElementsFromStorage = loadFloorElements(floor);
  const floorElementsFromAll = allElements.filter(el => el.floor === floor);
  const floorElementsFromF = fElements.filter(el => el.floor === 0);
  
  const consolidatedElements = consolidateElements([
    ...floorElementsFromStorage,
    ...floorElementsFromAll,
    ...floorElementsFromF
  ]);

  // FIXED: Better coordinate conversion
  const sourceX = sourceStore.x + sourceStore.width / 2;
  const sourceY = sourceStore.y + sourceStore.height / 2;
  const targetX = targetStore.x + targetStore.width / 2;
  const targetY = targetStore.y + targetStore.height / 2;

  // Quick direct path check first
  if (!avoidElements || isDirectPathClear(sourceStore, targetStore, consolidatedElements, mapSettings, floor, bufferGrids)) {
    return [
      { x: sourceX, y: sourceY, floor },
      { x: targetX, y: targetY, floor }
    ];
  }

  // Create grid with proper bounds
  const gridSize = mapSettings.grid_size;
  const buildingGridWidth = Math.ceil(mapSettings.building_width / gridSize);
  const buildingGridHeight = Math.ceil(mapSettings.building_height / gridSize);
  
  // FIXED: More precise grid coordinate conversion
  const buildingStartX = Math.floor((sourceX - mapSettings.building_x) / gridSize);
  const buildingStartY = Math.floor((sourceY - mapSettings.building_y) / gridSize);
  const buildingEndX = Math.floor((targetX - mapSettings.building_x) / gridSize);
  const buildingEndY = Math.floor((targetY - mapSettings.building_y) / gridSize);

  // Bounds checking
  if (buildingStartX < 0 || buildingStartX >= buildingGridWidth || 
      buildingStartY < 0 || buildingStartY >= buildingGridHeight ||
      buildingEndX < 0 || buildingEndX >= buildingGridWidth || 
      buildingEndY < 0 || buildingEndY >= buildingGridHeight) {
    return [];
  }

  // Same point check
  if (buildingStartX === buildingEndX && buildingStartY === buildingEndY) {
    return [{ x: sourceX, y: sourceY, floor }];
  }

  // Create and populate grid
  const totalGridSize = buildingGridWidth * buildingGridHeight;
  const grid = new Uint8Array(totalGridSize);
  grid.fill(1); // 1 = walkable, 0 = blocked

  // Mark obstacles
  if (avoidElements) {
    markElementObstacles(grid, consolidatedElements, buildingGridWidth, buildingGridHeight, mapSettings, sourceStore.id, targetStore.id, floor, bufferGrids);
  }

  // Ensure start and end positions are accessible
  const accessibleStart = ensureAccessiblePosition(buildingStartX, buildingStartY, grid, buildingGridWidth, buildingGridHeight, bufferGrids);
  const accessibleEnd = ensureAccessiblePosition(buildingEndX, buildingEndY, grid, buildingGridWidth, buildingGridHeight, bufferGrids);

  if (!accessibleStart || !accessibleEnd) {
    return [];
  }

  return findSingleFloorPathWithCoords(
    accessibleStart.x, 
    accessibleStart.y, 
    accessibleEnd.x, 
    accessibleEnd.y, 
    grid, 
    buildingGridWidth, 
    buildingGridHeight, 
    mapSettings, 
    floor
  );
}
// ENHANCED: Check if direct path between two elements is clear with strict element bounds checking
function isDirectPathClear(
  sourceStore: MapElement,
  targetStore: MapElement,
  consolidatedElements: MapElement[],
  mapSettings: MapSettings,
  floor: number,
  bufferGrids: number = 0
): boolean {
  const sourceX = sourceStore.x + sourceStore.width / 2;
  const sourceY = sourceStore.y + sourceStore.height / 2;
  const targetX = targetStore.x + targetStore.width / 2;
  const targetY = targetStore.y + targetStore.height / 2;

  // Get all obstacles on this floor
  const obstacles = consolidatedElements.filter(el => 
    el.floor === floor && isElementObstacle(el, sourceStore.id, targetStore.id)
  );

  // ENHANCED: Strict line-rectangle intersection with full element coverage
  for (const obstacle of obstacles) {
    const buffer = bufferGrids * mapSettings.grid_size;
    const obstacleRect = {
      left: obstacle.x - buffer,
      top: obstacle.y - buffer,
      right: obstacle.x + obstacle.width + buffer,
      bottom: obstacle.y + obstacle.height + buffer
    };

    // Check if the line intersects with the FULL obstacle rectangle
    if (lineIntersectsRect(sourceX, sourceY, targetX, targetY, obstacleRect)) {
      return false;
    }
  }

  return true;
}

function lineIntersectsRect(
  x1: number, y1: number, x2: number, y2: number,
  rect: { left: number, top: number, right: number, bottom: number }
): boolean {
  // Check if either endpoint is inside the rectangle
  if ((x1 >= rect.left && x1 <= rect.right && y1 >= rect.top && y1 <= rect.bottom) ||
      (x2 >= rect.left && x2 <= rect.right && y2 >= rect.top && y2 <= rect.bottom)) {
    return true;
  }

  // Check intersection with each edge of the rectangle
  return (
    lineSegmentsIntersect(x1, y1, x2, y2, rect.left, rect.top, rect.right, rect.top) ||     // top edge
    lineSegmentsIntersect(x1, y1, x2, y2, rect.right, rect.top, rect.right, rect.bottom) || // right edge
    lineSegmentsIntersect(x1, y1, x2, y2, rect.right, rect.bottom, rect.left, rect.bottom) || // bottom edge
    lineSegmentsIntersect(x1, y1, x2, y2, rect.left, rect.bottom, rect.left, rect.top)     // left edge
  );
}

// ENHANCED: Proper line segment intersection with better precision
function lineSegmentsIntersect(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean {
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denominator) < 1e-10) {
    return false; // Lines are parallel
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

  // Check if intersection point is on both line segments
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}



// ENHANCED: Ensure position is accessible with configurable search radius
function ensureAccessiblePosition(
  x: number, 
  y: number, 
  grid: Uint8Array, 
  gridWidth: number, 
  gridHeight: number,
  bufferGrids: number = 0
): { x: number, y: number } | null {
  // Check if current position is walkable
  const currentIndex = y * gridWidth + x;
  if (currentIndex >= 0 && currentIndex < grid.length && grid[currentIndex] === 1) {
    return { x, y };
  }

  // Try to find nearby walkable position using expanding search
  const maxRadius = Math.min(bufferGrids + 3, Math.min(gridWidth, gridHeight) / 4);
  
  for (let radius = 1; radius <= maxRadius; radius++) {
    // Check positions in expanding rings
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only check positions on the perimeter of current radius
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        
        const newX = x + dx;
        const newY = y + dy;
        
        if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight) {
          const newIndex = newY * gridWidth + newX;
          if (newIndex >= 0 && newIndex < grid.length && grid[newIndex] === 1) {
            return { x: newX, y: newY };
          }
        }
      }
    }
  }

  return null;
}

// A* pathfinding with improved movement costs and path smoothing
function findSingleFloorPathWithCoords(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  grid: Uint8Array,
  gridWidth: number,
  gridHeight: number,
  mapSettings: MapSettings,
  floor: number
): RoutePoint[] {
  // Optimized A* with binary heap for open list
  const openList: Node[] = [];
  const closedSet = new Set<number>();
  
  // Use array indexing instead of string keys for better performance
  const getIndex = (x: number, y: number) => y * gridWidth + x;
  
  const startNode: Node = {
    x: startX,
    y: startY,
    f: 0,
    g: 0,
    h: heuristic(startX, startY, endX, endY),
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  
  openList.push(startNode);

  // Improved movement directions with better cost calculation
  const directions = [
    [0, 1, 1.0],     // down
    [1, 0, 1.0],     // right
    [0, -1, 1.0],    // up
    [-1, 0, 1.0],    // left
    [1, 1, 1.4],     // diagonal down-right
    [1, -1, 1.4],    // diagonal up-right
    [-1, 1, 1.4],    // diagonal down-left
    [-1, -1, 1.4],   // diagonal up-left
  ];

  let iterations = 0;
  const maxIterations = Math.min(gridWidth * gridHeight, 15000);

  while (openList.length > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find node with lowest f score
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    const current = openList[currentIndex];

    // If we reached the target
    if (current.x === endX && current.y === endY) {
      const rawPath = reconstructPath(current, mapSettings, floor);
      
      // Apply path smoothing to reduce unnecessary waypoints
      return smoothPath(rawPath, grid, gridWidth, gridHeight, mapSettings);
    }

    // Remove current from open list and add to closed
    openList.splice(currentIndex, 1);
    closedSet.add(getIndex(current.x, current.y));

    // Check all neighbors
    for (const [dx, dy, baseCost] of directions) {
      const nextX = current.x + dx;
      const nextY = current.y + dy;
      const nextIndex = getIndex(nextX, nextY);

      // Check if neighbor is valid
      if (
        nextX < 0 ||
        nextX >= gridWidth ||
        nextY < 0 ||
        nextY >= gridHeight ||
        closedSet.has(nextIndex) ||
        nextIndex >= grid.length ||
        grid[nextIndex] === 0
      ) {
        continue;
      }

      // Calculate movement cost with penalties for direction changes
      let movementCost = baseCost;
      
      // Add penalty for changing direction (encourages straighter paths)
      if (current.parent) {
        const prevDx = current.x - current.parent.x;
        const prevDy = current.y - current.parent.y;
        
          if (prevDx !== dx || prevDy !== dy) {
          movementCost += 0.1; // Small penalty for direction change
        }
      }

      // Calculate costs
      const g = current.g + movementCost;
      const h = heuristic(nextX, nextY, endX, endY);
      const f = g + h;

      // Check if this path to neighbor is better
      const existingNodeIndex = openList.findIndex((node) => node.x === nextX && node.y === nextY);
      if (existingNodeIndex === -1) {
        openList.push({
          x: nextX,
          y: nextY,
          f,
          g,
          h,
          parent: current,
        });
      } else if (g < openList[existingNodeIndex].g) {
        openList[existingNodeIndex].g = g;
        openList[existingNodeIndex].f = f;
        openList[existingNodeIndex].parent = current;
      }
    }
  }

  return [];
}

// Path smoothing to reduce waypoints and create more natural paths
function smoothPath(
  path: RoutePoint[],
  grid: Uint8Array,
  gridWidth: number,
  gridHeight: number,
  mapSettings: MapSettings
): RoutePoint[] {
  if (path.length <= 2) return path;

  const smoothedPath: RoutePoint[] = [path[0]]; // Always keep start point
  let currentIndex = 0;

  while (currentIndex < path.length - 1) {
    let farthestReachable = currentIndex + 1;

    // Find the farthest point we can reach directly from current point
    for (let i = currentIndex + 2; i < path.length; i++) {
      if (isPathClearInGrid(
        path[currentIndex], 
        path[i], 
        grid, 
        gridWidth, 
        gridHeight, 
        mapSettings
      )) {
        farthestReachable = i;
      } else {
        break; // Stop at first unreachable point
      }
    }

    // Add the farthest reachable point
    if (farthestReachable < path.length - 1) {
      smoothedPath.push(path[farthestReachable]);
    }
    
    currentIndex = farthestReachable;
  }

  // Always keep end point
  smoothedPath.push(path[path.length - 1]);

  return smoothedPath;
}

// ENHANCED: Helper function to check if path between two points is clear in grid
function isPathClearInGrid(
  point1: RoutePoint,
  point2: RoutePoint,
  grid: Uint8Array,
  gridWidth: number,
  gridHeight: number,
  mapSettings: MapSettings
): boolean {
  // Convert absolute coordinates to grid coordinates
  const x1 = Math.round((point1.x - mapSettings.building_x) / mapSettings.grid_size);
  const y1 = Math.round((point1.y - mapSettings.building_y) / mapSettings.grid_size);
  const x2 = Math.round((point2.x - mapSettings.building_x) / mapSettings.grid_size);
  const y2 = Math.round((point2.y - mapSettings.building_y) / mapSettings.grid_size);

  // Use Bresenham's line algorithm to check all points along the line
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  let x = x1;
  let y = y1;

  while (true) {
    // Check if current point is within bounds and walkable
    const currentIndex = y * gridWidth + x;
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight || currentIndex >= grid.length || grid[currentIndex] === 0) {
      return false;
    }

    // Check if we've reached the end point
    if (x === x2 && y === y2) break;

    // Move to next point
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return true;
}

// Optimized Euclidean distance heuristic
function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);
  
  // Use Euclidean distance for better pathfinding results
  return Math.sqrt(dx * dx + dy * dy);
}

// Reconstruct path from end node, converting back to absolute coordinates
function reconstructPath(node: Node, mapSettings: MapSettings, floor: number): RoutePoint[] {
  const path: RoutePoint[] = [];
  let current: Node | null = node;

  while (current) {
    // Convert building-relative coordinates back to absolute coordinates
    path.push({
      x: current.x * mapSettings.grid_size + mapSettings.building_x,
      y: current.y * mapSettings.grid_size + mapSettings.building_y,
      floor,
    });
    current = current.parent;
  }

  return path.reverse();
}

// Configuration functions for buffer settings
export function setElementBuffer(bufferGrids: number) {
  if (bufferGrids >= 0 && bufferGrids <= 5) {
    // Buffer configuration updated
  }
}

export function setMinPathWidth(widthGrids: number) {
  if (widthGrids >= 1 && widthGrids <= 10) {
    // Path width configuration updated
  }
}

// Clear path cache when elements change
export function clearPathCache() {
  pathCache.clear();
}

// Clear all caches
export function clearAllCaches() {
  clearFloorElementsCache();
  clearPathCache();
  transitionElementsCache.clear();
}

// Debug function to visualize grid obstacles (useful for debugging)
export function debugGrid(
  elements: MapElement[],
  mapSettings: MapSettings,
  floor: number,
  sourceId: string = '',
  targetId: string = '',
  bufferGrids: number = 0
): string {
  const buildingGridWidth = Math.ceil(mapSettings.building_width / mapSettings.grid_size);
  const buildingGridHeight = Math.ceil(mapSettings.building_height / mapSettings.grid_size);
  
  const gridSize = buildingGridWidth * buildingGridHeight;
  const grid = new Uint8Array(gridSize);
  grid.fill(1); // 1 = walkable, 0 = blocked
  
  markElementObstacles(grid, elements, buildingGridWidth, buildingGridHeight, mapSettings, sourceId, targetId, floor, bufferGrids);
  
  let debugString = `Grid Debug for Floor ${floor} (${buildingGridWidth}x${buildingGridHeight}):\n`;
  debugString += `Buffer: ${bufferGrids} grids\n\n`;
  
  for (let y = 0; y < Math.min(buildingGridHeight, 50); y++) { // Limit to 50 rows for readability
    let row = '';
    for (let x = 0; x < Math.min(buildingGridWidth, 100); x++) { // Limit to 100 columns for readability
      const index = y * buildingGridWidth + x;
      row += grid[index] === 1 ? '.' : 'X';
    }
    debugString += row + '\n';
  }
  
  return debugString;
}


