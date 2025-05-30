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
  const buildingGridWidth = Math.ceil(mapSettings.building_width / mapSettings.grid_size);
  const buildingGridHeight = Math.ceil(mapSettings.building_height / mapSettings.grid_size);
  
  // Convert absolute coordinates to building-relative coordinates
  const buildingStartX = Math.round((sourceStore.x + sourceStore.width / 2 - mapSettings.building_x) / mapSettings.grid_size);
  const buildingStartY = Math.round((sourceStore.y + sourceStore.height / 2 - mapSettings.building_y) / mapSettings.grid_size);
  const buildingEndX = Math.round((targetStore.x + targetStore.width / 2 - mapSettings.building_x) / mapSettings.grid_size);
  const buildingEndY = Math.round((targetStore.y + targetStore.height / 2 - mapSettings.building_y) / mapSettings.grid_size);

  // Check if start/end points are within building bounds
  if (buildingStartX < 0 || buildingStartX >= buildingGridWidth || buildingStartY < 0 || buildingStartY >= buildingGridHeight ||
      buildingEndX < 0 || buildingEndX >= buildingGridWidth || buildingEndY < 0 || buildingEndY >= buildingGridHeight) {
    return [];
  }

  // Create grid - initially all cells are walkable within building
  const grid: boolean[][] = Array(buildingGridHeight)
    .fill(null)
    .map(() => Array(buildingGridWidth).fill(true));

  // Mark obstacles if avoidElements is true
  if (avoidElements) {
    const floorElements = allElements.filter(
      (el) => el.floor === floor && 
               el.id !== sourceStore.id && 
               el.id !== targetStore.id &&
               el.walkable === false // Only mark non-walkable elements as obstacles
    );

    floorElements.forEach((element) => {
      // Convert element coordinates to building-relative grid coordinates
      const minX = Math.floor((element.x - mapSettings.building_x) / mapSettings.grid_size);
      const maxX = Math.ceil((element.x + element.width - mapSettings.building_x) / mapSettings.grid_size);
      const minY = Math.floor((element.y - mapSettings.building_y) / mapSettings.grid_size);
      const maxY = Math.ceil((element.y + element.height - mapSettings.building_y) / mapSettings.grid_size);

      // Mark grid cells as obstacles (only within building bounds)
      for (let y = Math.max(0, minY); y < Math.min(maxY, buildingGridHeight); y++) {
        for (let x = Math.max(0, minX); x < Math.min(maxX, buildingGridWidth); x++) {
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
  const maxIterations = buildingGridWidth * buildingGridHeight; // Prevent infinite loops

  while (openList.length > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find node with lowest f score
    let current = openList.reduce((min, node) => (node.f < min.f ? node : min), openList[0]);

    // If we reached the target
    if (current.x === buildingEndX && current.y === buildingEndY) {
      console.log(`Path found in ${iterations} iterations`);
      return reconstructPath(current, mapSettings, floor);
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
        nextX >= buildingGridWidth ||
        nextY < 0 ||
        nextY >= buildingGridHeight ||
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
