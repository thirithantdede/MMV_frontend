// pathfinding.ts
import type { MapElement, MapSettings, RoutePoint } from "@/types";

interface Node {
  x: number;
  y: number;
  f: number; // Total cost (g + h)
  g: number; // Cost from start
  h: number; // Heuristic to goal
  parent: Node | null;
}

// Cache for loaded floor elements to avoid repeated localStorage reads
const floorElementsCache = new Map<number, MapElement[]>();
const cacheTimestamp = new Map<number, number>();
const CACHE_DURATION = 5000; // 5 seconds cache

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
    let sharedElements = floorElementsCache.get(0);
    if (!sharedElements || !cacheTimestamp.get(0) || (now - cacheTimestamp.get(0)!) >= CACHE_DURATION) {
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
    console.error(`Error loading floor ${floor} elements:`, error);
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
  const transitionTypes = ["elevator", "escalator", "stairs"];
  const transitions = floorElements.filter(element => transitionTypes.includes(element.type));
  
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
  avoidElements: boolean = false,
): RoutePoint[] {
  // Check cache first for multi-floor paths (they're more expensive)
  if (sourceStore.floor !== targetStore.floor) {
    const cacheKey = getPathCacheKey(sourceStore, targetStore);
    const cached = pathCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < PATH_CACHE_DURATION) {
      console.log('Using cached multi-floor path');
      return cached.path;
    }
    
    const path = findMultiFloorPath(sourceStore, targetStore, allElements, fElements, mapSettings, avoidElements);
    
    // Cache the result
    pathCache.set(cacheKey, { path, timestamp: now });
    return path;
  }

  // Single floor paths are usually fast enough not to cache
  return findSingleFloorPath(sourceStore, targetStore, allElements, fElements, mapSettings, avoidElements);
}

function findMultiFloorPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  fElements: MapElement[],
  mapSettings: MapSettings,
  avoidElements: boolean = false,
): RoutePoint[] {
  console.log(`Finding multi-floor path from floor ${sourceStore.floor} to floor ${targetStore.floor}`);
  
  const path: RoutePoint[] = [];
  const sourceFloor = sourceStore.floor;
  const targetFloor = targetStore.floor;
  
  // Determine the direction of floor movement
  const isGoingUp = targetFloor > sourceFloor;
  const floorDirection = isGoingUp ? 1 : -1;
  
  // Step 1: Find path from source to nearest transition on source floor
  const sourceFloorTransitions = findTransitionElements(sourceFloor);
  if (sourceFloorTransitions.length === 0) {
    console.error(`No transition elements found on floor ${sourceFloor}`);
    return [];
  }
  
  const nearestSourceTransition = findNearestTransition(sourceStore, sourceFloorTransitions);
  if (!nearestSourceTransition) {
    console.error(`Could not find nearest transition on floor ${sourceFloor}`);
    return [];
  }

  console.log(nearestSourceTransition)
  
  // Get all elements for source floor
  const sourceFloorElements = loadFloorElements(sourceFloor);
  
  // Get path from source to transition on source floor
  const sourceToTransitionPath = findSingleFloorPath(
    sourceStore,
    nearestSourceTransition,
    sourceFloorElements,
    fElements,
    mapSettings,
    avoidElements
  );
  
  if (sourceToTransitionPath.length === 0) {
    console.error(`Could not find path from source to transition on floor ${sourceFloor}`);
    return [];
  }
  
  path.push(...sourceToTransitionPath);
  
  // Step 2: Create transition points for intermediate floors
  let currentFloor = sourceFloor;
  let currentTransition = nearestSourceTransition;
  
  while (currentFloor !== targetFloor) {
    const nextFloor = currentFloor + floorDirection;
    
    // Find corresponding transition element on the next floor
    const nextFloorTransitions = findTransitionElements(nextFloor);
    
    const correspondingTransition = nextFloorTransitions.find(t => 
      t.type === currentTransition.type &&
      Math.abs(t.x - currentTransition.x) < 50 && // Allow some tolerance for positioning
      Math.abs(t.y - currentTransition.y) < 50
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
        console.error(`No fallback transition found on floor ${nextFloor}`);
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
  const targetFloorElements = loadFloorElements(targetFloor);
  const targetFloorTransitions = findTransitionElements(targetFloor);
  
  // Find the transition element on target floor that corresponds to our current transition
  const targetFloorTransition = targetFloorTransitions.find(t => 
    t.type === currentTransition.type &&
    Math.abs(t.x - currentTransition.x) < 50 &&
    Math.abs(t.y - currentTransition.y) < 50
  ) || currentTransition; // Use current transition if no corresponding one found
  
  // Get path from transition to target on target floor
  const transitionToTargetPath = findSingleFloorPath(
    targetFloorTransition,
    targetStore,
    targetFloorElements,
    fElements,
    mapSettings,
    avoidElements
  );
  
  if (transitionToTargetPath.length > 0) {
    // Remove the first point to avoid duplication with the last transition point
    path.push(...transitionToTargetPath.slice(1));
  } else {
    // If no path found, at least add the target point
    path.push({
      x: targetStore.x + targetStore.width / 2,
      y: targetStore.y + targetStore.height / 2,
      floor: targetFloor
    });
  }
  
  console.log(`Multi-floor path found with ${path.length} points`);
  return path;
}

// Optimized A* with early termination and better heuristics
function findSingleFloorPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  fElements: MapElement[],
  mapSettings: MapSettings,
  avoidElements: boolean = false,
): RoutePoint[] {
  const floor = sourceStore.floor != 0 ? sourceStore.floor : targetStore.floor;

  // Quick distance check - if stores are very close, return direct path
  const directDistance = calculateDistance(sourceStore, targetStore);
  if (directDistance < mapSettings.grid_size * 3) {
    return [
      { x: sourceStore.x + sourceStore.width / 2, y: sourceStore.y + sourceStore.height / 2, floor },
      { x: targetStore.x + targetStore.width / 2, y: targetStore.y + targetStore.height / 2, floor }
    ];
  }

  // Create grid based on building boundaries
  const buildingGridWidth = Math.ceil(mapSettings.building_width / mapSettings.grid_size);
  const buildingGridHeight = Math.ceil(mapSettings.building_height / mapSettings.grid_size);
  
  // Convert absolute coordinates to building-relative coordinates
  const buildingStartX = Math.round((sourceStore.x + sourceStore.width / 2 - mapSettings.building_x) / mapSettings.grid_size);
  const buildingStartY = Math.round((sourceStore.y + sourceStore.height / 2 - mapSettings.building_y) / mapSettings.grid_size);
  const buildingEndX = Math.round((targetStore.x + targetStore.width / 2 - mapSettings.building_x) / mapSettings.grid_size);
  const buildingEndY = Math.round((targetStore.y + targetStore.height / 2 - mapSettings.building_y) / mapSettings.grid_size);

  // Check bounds
  if (buildingStartX < 0 || buildingStartX >= buildingGridWidth || buildingStartY < 0 || buildingStartY >= buildingGridHeight ||
      buildingEndX < 0 || buildingEndX >= buildingGridWidth || buildingEndY < 0 || buildingEndY >= buildingGridHeight) {
    console.error('Start or end point outside building bounds');
    return [];
  }

  // If same point, return single point
  if (buildingStartX === buildingEndX && buildingStartY === buildingEndY) {
    return [{ x: buildingStartX * mapSettings.grid_size + mapSettings.building_x, y: buildingStartY * mapSettings.grid_size + mapSettings.building_y, floor }];
  }

  // Create grid - use Uint8Array for better memory efficiency
  const gridSize = buildingGridWidth * buildingGridHeight;
  const grid = new Uint8Array(gridSize);
  grid.fill(1); // 1 = walkable, 0 = blocked

  // Mark obstacles if avoidElements is true
  if (avoidElements) {
    const floorElements = allElements.filter(
      (el) => (el.floor === floor && 
               el.id !== sourceStore.id && 
               el.id !== targetStore.id &&
               el.walkable === false)
    );

    // Process fElements
    for (const element of fElements) {
      if (element.id === sourceStore.id || element.id === targetStore.id) continue;
      
      const minX = Math.max(0, Math.floor((element.x - mapSettings.building_x) / mapSettings.grid_size));
      const maxX = Math.min(buildingGridWidth, Math.ceil((element.x + element.width - mapSettings.building_x) / mapSettings.grid_size));
      const minY = Math.max(0, Math.floor((element.y - mapSettings.building_y) / mapSettings.grid_size));
      const maxY = Math.min(buildingGridHeight, Math.ceil((element.y + element.height - mapSettings.building_y) / mapSettings.grid_size));
      
      for (let y = minY; y < maxY; y++) {
        for (let x = minX; x < maxX; x++) {
          grid[y * buildingGridWidth + x] = 0;
        }
      }
    }

    // Process floor elements
    for (const element of floorElements) {
      const minX = Math.max(0, Math.floor((element.x - mapSettings.building_x) / mapSettings.grid_size));
      const maxX = Math.min(buildingGridWidth, Math.ceil((element.x + element.width - mapSettings.building_x) / mapSettings.grid_size));
      const minY = Math.max(0, Math.floor((element.y - mapSettings.building_y) / mapSettings.grid_size));
      const maxY = Math.min(buildingGridHeight, Math.ceil((element.y + element.height - mapSettings.building_y) / mapSettings.grid_size));

      for (let y = minY; y < maxY; y++) {
        for (let x = minX; x < maxX; x++) {
          grid[y * buildingGridWidth + x] = 0;
        }
      }
    }
  }

  // Check if start and end positions are walkable
  if (grid[buildingStartY * buildingGridWidth + buildingStartX] === 0) {
    console.error('Start position is blocked');
    return [];
  }
  
  if (grid[buildingEndY * buildingGridWidth + buildingEndX] === 0) {
    console.error('End position is blocked');
    return [];
  }

  // Optimized A* with binary heap for open list
  const openList: Node[] = [];
  const closedSet = new Set<number>();
  
  // Use array indexing instead of string keys for better performance
  const getIndex = (x: number, y: number) => y * buildingGridWidth + x;
  
  const startNode: Node = {
    x: buildingStartX,
    y: buildingStartY,
    f: 0,
    g: 0,
    h: heuristic(buildingStartX, buildingStartY, buildingEndX, buildingEndY),
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  
  openList.push(startNode);

  // Possible movements (8 directions) - prioritize cardinal directions
  const directions = [
    [0, 1, 1],   // down
    [1, 0, 1],   // right
    [0, -1, 1],  // up
    [-1, 0, 1],  // left
    [1, 1, 1.414],   // diagonal down-right
    [1, -1, 1.414],  // diagonal up-right
    [-1, 1, 1.414],  // diagonal down-left
    [-1, -1, 1.414], // diagonal up-left
  ];

  let iterations = 0;
  const maxIterations = Math.min(gridSize, 10000); // Limit iterations for performance

  while (openList.length > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find node with lowest f score (simple linear search for small lists)
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    const current = openList[currentIndex];

    // If we reached the target
    if (current.x === buildingEndX && current.y === buildingEndY) {
      return reconstructPath(current, mapSettings, floor);
    }

    // Remove current from open list and add to closed
    openList.splice(currentIndex, 1);
    closedSet.add(getIndex(current.x, current.y));

    // Check all neighbors
    for (const [dx, dy, cost] of directions) {
      const nextX = current.x + dx;
      const nextY = current.y + dy;
      const nextIndex = getIndex(nextX, nextY);

      // Check if neighbor is valid
      if (
        nextX < 0 ||
        nextX >= buildingGridWidth ||
        nextY < 0 ||
        nextY >= buildingGridHeight ||
        closedSet.has(nextIndex) ||
        grid[nextIndex] === 0
      ) {
        continue;
      }

      // Calculate costs
      const g = current.g + cost;
      const h = heuristic(nextX, nextY, buildingEndX, buildingEndY);
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

  console.error('No path found within building boundaries');
  return [];
}

// Optimized Manhattan distance heuristic
function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
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
