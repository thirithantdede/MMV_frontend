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
    // return findMultiFloorPath(sourceStore, targetStore, allElements, mapSettings, avoidElements);
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

  // Create grid based on building boundaries
  const { gridWidth, gridHeight, offsetX, offsetY } = calculateBuildingGrid(mapSettings);
  
  // Convert coordinates to building-relative grid coordinates
  const buildingStartX = Math.round((sourceStore.x + sourceStore.width / 2 - mapSettings.building_x) / mapSettings.grid_size);
  const buildingStartY = Math.round((sourceStore.y + sourceStore.height / 2 - mapSettings.building_y) / mapSettings.grid_size);
  const buildingEndX = Math.round((targetStore.x + targetStore.width / 2 - mapSettings.building_x) / mapSettings.grid_size);
  const buildingEndY = Math.round((targetStore.y + targetStore.height / 2 - mapSettings.building_y) / mapSettings.grid_size);

  // Check if start/end points are within building bounds
  if (buildingStartX < 0 || buildingStartX >= gridWidth || buildingStartY < 0 || buildingStartY >= gridHeight ||
      buildingEndX < 0 || buildingEndX >= gridWidth || buildingEndY < 0 || buildingEndY >= gridHeight) {
    console.error('Start or end point outside building bounds:', {
      start: { x: buildingStartX, y: buildingStartY },
      end: { x: buildingEndX, y: buildingEndY },
      buildingBounds: { width: gridWidth, height: gridHeight },
      buildingArea: { 
        x: mapSettings.building_x, 
        y: mapSettings.building_y, 
        width: mapSettings.building_width, 
        height: mapSettings.building_height 
      }
    });
    return [];
  }

  // Create grid - initially all cells are walkable within building
  const grid: boolean[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(true));

  // Mark obstacles if avoidElements is true
  if (avoidElements) {
    const floorElements = allElements.filter(
      (el) => el.floor === floor && 
               el.id !== sourceStore.id && 
               el.id !== targetStore.id &&
               !el.walkable // Only non-walkable elements are obstacles
    );

    floorElements.forEach((element) => {
      // Convert element coordinates to building-relative grid coordinates
      const minX = Math.floor((element.x - mapSettings.building_x) / mapSettings.grid_size);
      const maxX = Math.ceil((element.x + element.width - mapSettings.building_x) / mapSettings.grid_size);
      const minY = Math.floor((element.y - mapSettings.building_y) / mapSettings.grid_size);
      const maxY = Math.ceil((element.y + element.height - mapSettings.building_y) / mapSettings.grid_size);

      // Mark grid cells as obstacles (only within building bounds)
      for (let y = Math.max(0, minY); y < Math.min(maxY, gridHeight); y++) {
        for (let x = Math.max(0, minX); x < Math.min(maxX, gridWidth); x++) {
          grid[y][x] = false;
        }
      }
    });
  }

  // Check if start and end positions are walkable
  if (!grid[buildingStartY][buildingStartX]) {
    console.error('Start position is blocked:', { x: buildingStartX, y: buildingStartY });
    return [];
  }
  
  if (!grid[buildingEndY][buildingEndX]) {
    console.error('End position is blocked:', { x: buildingEndX, y: buildingEndY });
    return [];
  }

  // A* algorithm
  const openList: Node[] = [
    {
      x: buildingStartX,
      y: buildingStartY,
      f: 0,
      g: 0,
      h: heuristic(buildingStartX, buildingStartY, buildingEndX, buildingEndY),
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
    if (current.x === buildingEndX && current.y === buildingEndY) {
      console.log(`Path found in ${iterations} iterations`);
      return reconstructBuildingPath(current, mapSettings, floor);
    }

    // Remove current from open list and add to closed
    openList.splice(openList.indexOf(current), 1);
    closedList.add(`${current.x},${current.y}`);

    // Check all neighbors
    for (const [dx, dy] of directions) {
      const nextX = current.x + dx;
      const nextY = current.y + dy;

      // Check if neighbor is valid (within building bounds)
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
      const h = heuristic(nextX, nextY, buildingEndX, buildingEndY);
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

  console.error('No path found within building boundaries');
  return [];
}

// Manhattan distance heuristic
function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// Reconstruct path from end node, converting back to absolute coordinates
function reconstructBuildingPath(node: Node, mapSettings: MapSettings, floor: number): RoutePoint[] {
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

// Calculate grid dimensions based on building footprint only
function calculateBuildingGrid(mapSettings: MapSettings): { 
  gridWidth: number; 
  gridHeight: number; 
  offsetX: number; 
  offsetY: number; 
} {
  // Grid dimensions based only on building footprint
  const gridWidth = Math.ceil(mapSettings.building_width / mapSettings.grid_size);
  const gridHeight = Math.ceil(mapSettings.building_height / mapSettings.grid_size);
  
  // Offset for converting absolute coordinates to building-relative coordinates
  const offsetX = mapSettings.building_x;
  const offsetY = mapSettings.building_y;

  return { gridWidth, gridHeight, offsetX, offsetY };
}

// Updated function to replace the old calculateGridBounds
function calculateGridBounds(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  mapSettings: MapSettings
): { gridWidth: number; gridHeight: number } {
  // Use building-based grid calculation instead
  const { gridWidth, gridHeight } = calculateBuildingGrid(mapSettings);
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

  // Calculate building-relative positions
  const sourceBuildingX = sourceCenterX - mapSettings.building_x;
  const sourceBuildingY = sourceCenterY - mapSettings.building_y;
  const targetBuildingX = targetCenterX - mapSettings.building_x;
  const targetBuildingY = targetCenterY - mapSettings.building_y;

  const startGridX = Math.floor(sourceBuildingX / mapSettings.grid_size);
  const startGridY = Math.floor(sourceBuildingY / mapSettings.grid_size);
  const endGridX = Math.floor(targetBuildingX / mapSettings.grid_size);
  const endGridY = Math.floor(targetBuildingY / mapSettings.grid_size);

  console.log('Vertical Pathfinding Debug:', {
    sourceElement: {
      id: sourceStore.id,
      name: sourceStore.name,
      bounds: { x: sourceStore.x, y: sourceStore.y, w: sourceStore.width, h: sourceStore.height },
      center: { x: sourceCenterX, y: sourceCenterY },
      buildingRelative: { x: sourceBuildingX, y: sourceBuildingY },
      gridPos: { x: startGridX, y: startGridY }
    },
    targetElement: {
      id: targetStore.id,
      name: targetStore.name,
      bounds: { x: targetStore.x, y: targetStore.y, w: targetStore.width, h: targetStore.height },
      center: { x: targetCenterX, y: targetCenterY },
      buildingRelative: { x: targetBuildingX, y: targetBuildingY },
      gridPos: { x: endGridX, y: endGridY }
    },
    alignment: {
      isVertical: Math.abs(startGridX - endGridX) <= 1,
      isHorizontal: Math.abs(startGridY - endGridY) <= 1,
      gridDistance: { x: Math.abs(startGridX - endGridX), y: Math.abs(startGridY - endGridY) }
    },
    buildingBounds: {
      x: mapSettings.building_x,
      y: mapSettings.building_y,
      width: mapSettings.building_width,
      height: mapSettings.building_height
    },
    mapSettings: {
      gridSize: mapSettings.grid_size,
      buildingSize: { w: mapSettings.building_width, h: mapSettings.building_height }
    }
  });
}