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

export function findPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  mapSettings: MapSettings,
  avoidElements: boolean = false,
): RoutePoint[] {
  // If stores are on different floors, use multi-floor pathfinding
  if (sourceStore.floor !== targetStore.floor) {
    return findMultiFloorPath(sourceStore, targetStore, allElements, mapSettings, avoidElements);
  }

  // If stores are on the same floor, use single-floor pathfinding
  return findSingleFloorPath(sourceStore, targetStore, allElements, mapSettings, avoidElements);
}

function findSingleFloorPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  mapSettings: MapSettings,
  avoidElements: boolean = false,
): RoutePoint[] {
  // Get center points of stores
  const startX = Math.round((sourceStore.x + sourceStore.width / 2) / mapSettings.grid_size);
  const startY = Math.round((sourceStore.y + sourceStore.height / 2) / mapSettings.grid_size);
  const endX = Math.round((targetStore.x + targetStore.width / 2) / mapSettings.grid_size);
  const endY = Math.round((targetStore.y + targetStore.height / 2) / mapSettings.grid_size);
  const floor = sourceStore.floor;

  // If same point, return single point
  if (startX === endX && startY === endY) {
    console.log('Same start and end point');
    return [{ x: startX * mapSettings.grid_size, y: startY * mapSettings.grid_size, floor }];
  }

  // Create grid
  const { gridWidth, gridHeight } = calculateGridBounds(sourceStore, targetStore, allElements, mapSettings);
  
  // Check if start/end points are within grid bounds
  if (startX < 0 || startX >= gridWidth || startY < 0 || startY >= gridHeight ||
      endX < 0 || endX >= gridWidth || endY < 0 || endY >= gridHeight) {
    console.error('Start or end point outside grid bounds:', {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      gridBounds: { width: gridWidth, height: gridHeight }
    });
    return [];
  }

  const grid: boolean[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(true));

  // Mark obstacles if avoidElements is true
  if (avoidElements) {
    const floorElements = allElements.filter(
      (el) => el.floor === floor && el.id !== sourceStore.id && el.id !== targetStore.id,
    );

    floorElements.forEach((element) => {
      const minX = Math.floor(element.x / mapSettings.grid_size);
      const maxX = Math.ceil((element.x + element.width) / mapSettings.grid_size);
      const minY = Math.floor(element.y / mapSettings.grid_size);
      const maxY = Math.ceil((element.y + element.height) / mapSettings.grid_size);

      // Mark grid cells as obstacles
      for (let y = minY; y < maxY && y < gridHeight; y++) {
        for (let x = minX; x < maxX && x < gridWidth; x++) {
          if (y >= 0 && x >= 0) {
            grid[y][x] = false;
          }
        }
      }
    });
  }

  // Check if start and end positions are walkable
  if (!grid[startY][startX]) {
    console.error('Start position is blocked:', { x: startX, y: startY });
    return [];
  }
  
  if (!grid[endY][endX]) {
    console.error('End position is blocked:', { x: endX, y: endY });
    return [];
  }

  // A* algorithm
  const openList: Node[] = [
    {
      x: startX,
      y: startY,
      f: 0,
      g: 0,
      h: heuristic(startX, startY, endX, endY),
      parent: null,
    },
  ];

  // Fix the f calculation for the initial node
  openList[0].f = openList[0].g + openList[0].h;

  const closedList: Set<string> = new Set();

  // Possible movements (8 directions)
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  let iterations = 0;
  const maxIterations = gridWidth * gridHeight; // Prevent infinite loops

  while (openList.length > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find node with lowest f score
    let current = openList.reduce((min, node) => (node.f < min.f ? node : min), openList[0]);

    // If we reached the target
    if (current.x === endX && current.y === endY) {
      console.log(`Path found in ${iterations} iterations`);
      return reconstructPath(current, mapSettings.grid_size, floor);
    }

    // Remove current from open list and add to closed
    openList.splice(openList.indexOf(current), 1);
    closedList.add(`${current.x},${current.y}`);

    // Check all neighbors
    for (const [dx, dy] of directions) {
      const nextX = current.x + dx;
      const nextY = current.y + dy;

      // Check if neighbor is valid
      if (
        nextX < 0 ||
        nextX >= gridWidth ||
        nextY < 0 ||
        nextY >= gridHeight ||
        closedList.has(`${nextX},${nextY}`) ||
        !grid[nextY][nextX]
      ) {
        continue;
      }

      // Calculate costs
      const g = current.g + (Math.abs(dx) + Math.abs(dy) === 2 ? 1.414 : 1); // Diagonal cost
      const h = heuristic(nextX, nextY, endX, endY);
      const f = g + h;

      // Check if this path to neighbor is better
      const existingNode = openList.find((node) => node.x === nextX && node.y === nextY);
      if (!existingNode) {
        openList.push({
          x: nextX,
          y: nextY,
          f,
          g,
          h,
          parent: current,
        });
      } else if (g < existingNode.g) {
        existingNode.g = g;
        existingNode.f = f;
        existingNode.parent = current;
      }
    }

    // Sort open list by f score (this is inefficient but let's keep it for now)
    openList.sort((a, b) => a.f - b.f);
  }


  
  return [];
}
// Manhattan distance heuristic
function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// Reconstruct path from end node
function reconstructPath(node: Node, gridSize: number, floor: number): RoutePoint[] {
  const path: RoutePoint[] = [];
  let current: Node | null = node;

  while (current) {
    path.push({
      x: current.x * gridSize,
      y: current.y * gridSize,
      floor,
    });
    current = current.parent;
  }

  return path.reverse();
}

function findMultiFloorPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  mapSettings: MapSettings,
  avoidElements: boolean = false,
): RoutePoint[] {
  const path: RoutePoint[] = [];
  const sourceFloor = sourceStore.floor;
  const targetFloor = targetStore.floor;

  // Get center points of stores
  const startX = sourceStore.x + sourceStore.width / 2;
  const startY = sourceStore.y + sourceStore.height / 2;
  const endX = targetStore.x + targetStore.width / 2;
  const endY = targetStore.y + targetStore.height / 2;

  // Find transport elements (elevators/escalators) on source and target floors
  const sourceFloorTransports = allElements.filter(
    (el) => (el.type === "elevator" || el.type === "escalator") && el.floor === sourceFloor,
  );
  const targetFloorTransports = allElements.filter(
    (el) => (el.type === "elevator" || el.type === "escalator") && el.floor === targetFloor,
  );

  if (sourceFloorTransports.length === 0 || targetFloorTransports.length === 0) {
    // Fallback: Direct path with floor transition (no transport elements found)
    path.push(
      { x: startX, y: startY, floor: sourceFloor },
      { x: (startX + endX) / 2, y: (startY + endY) / 2, floor: sourceFloor },
      { x: (startX + endX) / 2, y: (startY + endY) / 2, floor: targetFloor },
      { x: endX, y: endY, floor: targetFloor },
    );
    return path;
  }

  // Find the best pair of transport elements (closest combined distance)
  let bestSourceTransport: MapElement | null = null;
  let bestTargetTransport: MapElement | null = null;
  let minTotalDistance = Number.MAX_VALUE;

  sourceFloorTransports.forEach((sourceTransport) => {
    const sourceTransportX = sourceTransport.x + sourceTransport.width / 2;
    const sourceTransportY = sourceTransport.y + sourceTransport.height / 2;

    // Prefer same-name transport on target floor (same elevator/escalator)
    let targetTransport = targetFloorTransports.find((t) => t.name === sourceTransport.name);
    if (!targetTransport) {
      targetTransport = findNearestElement(endX, endY, targetFloorTransports);
    }
    const targetTransportX = targetTransport.x + targetTransport.width / 2;
    const targetTransportY = targetTransport.y + targetTransport.height / 2;

    // Calculate total distance: source -> sourceTransport -> targetTransport -> target
    const sourceDistance = Math.sqrt(
      Math.pow(sourceTransportX - startX, 2) + Math.pow(sourceTransportY - startY, 2),
    );
    const targetDistance = Math.sqrt(
      Math.pow(endX - targetTransportX, 2) + Math.pow(endY - targetTransportY, 2),
    );
    const totalDistance = sourceDistance + targetDistance;

    if (totalDistance < minTotalDistance) {
      minTotalDistance = totalDistance;
      bestSourceTransport = sourceTransport;
      bestTargetTransport = targetTransport;
    }
  });

  if (!bestSourceTransport || !bestTargetTransport) {
    // Fallback if no valid transport pair found
    return [
      { x: startX, y: startY, floor: sourceFloor },
      { x: endX, y: endY, floor: targetFloor },
    ];
  }

  // Get transport coordinates
  const sourceTransportX = bestSourceTransport.x + bestSourceTransport.width / 2;
  const sourceTransportY = bestSourceTransport.y + bestSourceTransport.height / 2;
  const targetTransportX = bestTargetTransport.x + bestTargetTransport.width / 2;
  const targetTransportY = bestTargetTransport.y + bestTargetTransport.height / 2;

  // Path from source to source transport (on source floor)
  const sourceToTransport = findSingleFloorPath(
    sourceStore,
    {
      ...bestSourceTransport,
      x: sourceTransportX - bestSourceTransport.width / 2,
      y: sourceTransportY - bestSourceTransport.height / 2,
      width: bestSourceTransport.width,
      height: bestSourceTransport.height,
    },
    allElements,
    mapSettings,
    avoidElements,
  );

  // Path from target transport to target (on target floor)
  const transportToTarget = findSingleFloorPath(
    {
      ...bestTargetTransport,
      x: targetTransportX - bestTargetTransport.width / 2,
      y: targetTransportY - bestTargetTransport.height / 2,
      width: bestTargetTransport.width,
      height: bestTargetTransport.height,
    },
    targetStore,
    allElements,
    mapSettings,
    avoidElements,
  );

  // Combine paths
  path.push(...sourceToTransport);

  // Add transition point if needed (remove duplicate points at transport)
  if (path.length > 0) {
    const lastPoint = path[path.length - 1];
    if (
      lastPoint.x !== sourceTransportX ||
      lastPoint.y !== sourceTransportY ||
      lastPoint.floor !== sourceFloor
    ) {
      path.push({ x: sourceTransportX, y: sourceTransportY, floor: sourceFloor });
    }
  }

  // Add target transport entry point
  path.push({ x: targetTransportX, y: targetTransportY, floor: targetFloor });

  // Add target floor path (skip first point if it's the same as the transport point)
  if (
    transportToTarget.length > 0 &&
    transportToTarget[0].x === targetTransportX &&
    transportToTarget[0].y === targetTransportY &&
    transportToTarget[0].floor === targetFloor
  ) {
    path.push(...transportToTarget.slice(1));
  } else {
    path.push(...transportToTarget);
  }

  return path;
}

// Helper function to find the nearest element from a point
function findNearestElement(x: number, y: number, elements: MapElement[]): MapElement {
  let nearestElement = elements[0];
  let minDistance = Number.MAX_VALUE;

  elements.forEach((element) => {
    const elementX = element.x + element.width / 2;
    const elementY = element.y + element.height / 2;
    const distance = Math.sqrt(Math.pow(elementX - x, 2) + Math.pow(elementY - y, 2));

    if (distance < minDistance) {
      minDistance = distance;
      nearestElement = element;
    }
  });

  return nearestElement;
}

function calculateGridBounds(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  mapSettings: MapSettings
): { gridWidth: number; gridHeight: number } {
  // Find the maximum coordinates from all elements on the same floor
  const floor = sourceStore.floor;
  const floorElements = allElements.filter(el => el.floor === floor);
  
  let maxX = Math.max(
    mapSettings.building_width,
    sourceStore.x + sourceStore.width,
    targetStore.x + targetStore.width
  );
  
  let maxY = Math.max(
    mapSettings.building_height,
    sourceStore.y + sourceStore.height,
    targetStore.y + targetStore.height
  );

  // Check all elements on this floor
  floorElements.forEach(element => {
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.height);
  });

  // Add some padding and convert to grid coordinates
  const gridWidth = Math.ceil((maxX + mapSettings.grid_size * 2) / mapSettings.grid_size);
  const gridHeight = Math.ceil((maxY + mapSettings.grid_size * 2) / mapSettings.grid_size);

  return { gridWidth, gridHeight };
}
export function debugVerticalPathfinding(
  sourceStore: MapElement,
  targetStore: MapElement,
  mapSettings: MapSettings
) {
  const sourceCenterX = sourceStore.x + (sourceStore.width / 2);
  const sourceCenterY = sourceStore.y + (sourceStore.height / 2);
  const targetCenterX = targetStore.x + (targetStore.width / 2);
  const targetCenterY = targetStore.y + (targetStore.height / 2);

  const startGridX = Math.floor(sourceCenterX / mapSettings.grid_size);
  const startGridY = Math.floor(sourceCenterY / mapSettings.grid_size);
  const endGridX = Math.floor(targetCenterX / mapSettings.grid_size);
  const endGridY = Math.floor(targetCenterY / mapSettings.grid_size);

  console.log('Vertical Pathfinding Debug:', {
    sourceElement: {
      id: sourceStore.id,
      name: sourceStore.name,
      bounds: { x: sourceStore.x, y: sourceStore.y, w: sourceStore.width, h: sourceStore.height },
      center: { x: sourceCenterX, y: sourceCenterY },
      gridPos: { x: startGridX, y: startGridY }
    },
    targetElement: {
      id: targetStore.id,
      name: targetStore.name,
      bounds: { x: targetStore.x, y: targetStore.y, w: targetStore.width, h: targetStore.height },
      center: { x: targetCenterX, y: targetCenterY },
      gridPos: { x: endGridX, y: endGridY }
    },
    alignment: {
      isVertical: Math.abs(startGridX - endGridX) <= 1,
      isHorizontal: Math.abs(startGridY - endGridY) <= 1,
      gridDistance: { x: Math.abs(startGridX - endGridX), y: Math.abs(startGridY - endGridY) }
    },
    mapSettings: {
      gridSize: mapSettings.grid_size,
      buildingSize: { w: mapSettings.building_width, h: mapSettings.building_height }
    }
  });
}