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
  console.log(`Found ${sourceFloorTransitions.length} transitions on source floor ${sourceFloor}:`, sourceFloorTransitions.map(t => t.name || t.type));
  
  if (sourceFloorTransitions.length === 0) {
    console.error(`No transition elements found on floor ${sourceFloor}`);
    return [];
  }
  
  const nearestSourceTransition = findNearestTransition(sourceStore, sourceFloorTransitions);
  if (!nearestSourceTransition) {
    console.error(`Could not find nearest transition on floor ${sourceFloor}`);
    return [];
  }

  console.log(`Using nearest transition on source floor: ${nearestSourceTransition.name || nearestSourceTransition.type}`);
  
  // Get all elements for source floor - FIXED: Use the correct elements array
  const sourceFloorElements = loadFloorElements(sourceFloor);
  console.log(`Loaded ${sourceFloorElements.length} elements for source floor ${sourceFloor}`);
  
  // FIXED: Combine allElements and fElements for pathfinding
  const combinedSourceElements = [...sourceFloorElements, ...allElements.filter(el => el.floor === sourceFloor)];
  
  // Get path from source to transition on source floor
  const sourceToTransitionPath = findSingleFloorPath(
    sourceStore,
    nearestSourceTransition,
    combinedSourceElements, // Use combined elements
    fElements,
    mapSettings,
    avoidElements
  );
  
  console.log(`Source to transition path length: ${sourceToTransitionPath.length}`);
  
  if (sourceToTransitionPath.length === 0) {
    console.error(`Could not find path from source to transition on floor ${sourceFloor}`);
    // Try alternative approach: add direct connection to transition
    console.log('Attempting direct connection to transition...');
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
    console.log(`Moving from floor ${currentFloor} to floor ${nextFloor}`);
    
    // Find corresponding transition element on the next floor
    const nextFloorTransitions = findTransitionElements(nextFloor);
    console.log(`Found ${nextFloorTransitions.length} transitions on next floor ${nextFloor}:`, nextFloorTransitions.map(t => t.name || t.type));
    
    if (nextFloorTransitions.length === 0) {
      console.error(`No transition elements found on floor ${nextFloor}`);
      return path; // Return partial path
    }
    
    const correspondingTransition = nextFloorTransitions.find(t => 
      t.type === currentTransition.type &&
      Math.abs(t.x - currentTransition.x) < 50 && // Allow some tolerance for positioning
      Math.abs(t.y - currentTransition.y) < 50
    );
    
    if (!correspondingTransition) {
      // Use the nearest transition as fallback
      const fallbackTransition = findNearestTransition(currentTransition, nextFloorTransitions);
      if (fallbackTransition) {
        console.log(`Using fallback transition on floor ${nextFloor}: ${fallbackTransition.name || fallbackTransition.type}`);
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
      console.log(`Using corresponding transition on floor ${nextFloor}: ${correspondingTransition.name || correspondingTransition.type}`);
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
  console.log(`Loaded ${targetFloorElements.length} elements for target floor ${targetFloor}`);
  
  const targetFloorTransitions = findTransitionElements(targetFloor);
  
  // Find the transition element on target floor that corresponds to our current transition
  const targetFloorTransition = targetFloorTransitions.find(t => 
    t.type === currentTransition.type &&
    Math.abs(t.x - currentTransition.x) < 50 &&
    Math.abs(t.y - currentTransition.y) < 50
  ) || currentTransition; // Use current transition if no corresponding one found
  
  console.log(`Using transition on target floor: ${targetFloorTransition.name || targetFloorTransition.type}`);
  
  // FIXED: Combine allElements and fElements for pathfinding on target floor
  const combinedTargetElements = [...targetFloorElements, ...allElements.filter(el => el.floor === targetFloor)];
  
  // Get path from transition to target on target floor
  const transitionToTargetPath = findSingleFloorPath(
    targetFloorTransition,
    targetStore,
    combinedTargetElements, // Use combined elements
    fElements,
    mapSettings,
    avoidElements
  );
  
  console.log(`Transition to target path length: ${transitionToTargetPath.length}`);
  
  if (transitionToTargetPath.length > 0) {
    // Remove the first point to avoid duplication with the last transition point
    path.push(...transitionToTargetPath.slice(1));
  } else {
    console.log('No path found from transition to target, adding direct connection...');
    // If no path found, add direct connection to target
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
  
  console.log(`Finding single floor path on floor ${floor} from ${sourceStore.name || sourceStore.type} to ${targetStore.name || targetStore.type}`);

  // Quick distance check - if stores are very close, return direct path
  const directDistance = calculateDistance(sourceStore, targetStore);
  if (directDistance < mapSettings.grid_size * 3) {
    console.log('Stores are very close, returning direct path');
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
    console.log(`Start: (${buildingStartX}, ${buildingStartY}), End: (${buildingEndX}, ${buildingEndY}), Grid: ${buildingGridWidth}x${buildingGridHeight}`);
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
    // FIXED: Filter elements properly for the current floor
    const floorElements = allElements.filter(
      (el) => (el.floor === floor && 
               el.id !== sourceStore.id && 
               el.id !== targetStore.id &&
               el.walkable === false)
    );

    console.log(`Processing ${floorElements.length} floor elements and ${fElements.length} fElements for obstacles`);

    // Process fElements - FIXED: Check floor properly
    for (const element of fElements) {
      if (element.id === sourceStore.id || element.id === targetStore.id) continue;
      if (element.floor !== floor) continue; // Only process elements on current floor
      
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
    // FIXED: Try to find a nearby walkable position
    const nearbyStart = findNearbyWalkablePosition(buildingStartX, buildingStartY, grid, buildingGridWidth, buildingGridHeight);
    if (nearbyStart) {
      console.log(`Found nearby walkable start position: (${nearbyStart.x}, ${nearbyStart.y})`);
      return findSingleFloorPathWithCoords(nearbyStart.x, nearbyStart.y, buildingEndX, buildingEndY, grid, buildingGridWidth, buildingGridHeight, mapSettings, floor);
    }
    return [];
  }
  
  if (grid[buildingEndY * buildingGridWidth + buildingEndX] === 0) {
    console.error('End position is blocked');
    // FIXED: Try to find a nearby walkable position
    const nearbyEnd = findNearbyWalkablePosition(buildingEndX, buildingEndY, grid, buildingGridWidth, buildingGridHeight);
    if (nearbyEnd) {
      console.log(`Found nearby walkable end position: (${nearbyEnd.x}, ${nearbyEnd.y})`);
      return findSingleFloorPathWithCoords(buildingStartX, buildingStartY, nearbyEnd.x, nearbyEnd.y, grid, buildingGridWidth, buildingGridHeight, mapSettings, floor);
    }
    return [];
  }

  return findSingleFloorPathWithCoords(buildingStartX, buildingStartY, buildingEndX, buildingEndY, grid, buildingGridWidth, buildingGridHeight, mapSettings, floor);
}

// FIXED: Helper function to find nearby walkable position
function findNearbyWalkablePosition(x: number, y: number, grid: Uint8Array, gridWidth: number, gridHeight: number, maxRadius: number = 5): { x: number, y: number } | null {
  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue; // Only check perimeter
        
        const newX = x + dx;
        const newY = y + dy;
        
        if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight) {
          if (grid[newY * gridWidth + newX] === 1) {
            return { x: newX, y: newY };
          }
        }
      }
    }
  }
  return null;
}

// FIXED: Separate function for A* pathfinding with coordinates
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
  const maxIterations = Math.min(gridWidth * gridHeight, 10000); // Limit iterations for performance

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
    if (current.x === endX && current.y === endY) {
      console.log(`Path found in ${iterations} iterations`);
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
        nextX >= gridWidth ||
        nextY < 0 ||
        nextY >= gridHeight ||
        closedSet.has(nextIndex) ||
        grid[nextIndex] === 0
      ) {
        continue;
      }

      // Calculate costs
      const g = current.g + cost;
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

  console.error(`No path found within building boundaries after ${iterations} iterations`);
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

