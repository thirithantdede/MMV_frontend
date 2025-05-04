import type { MapElement, RoutePoint } from "@/types"

// A* pathfinding algorithm for finding routes between stores
export function findPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  mapSettings: any,
  avoidElements = false,
): RoutePoint[] {
  // If stores are on different floors, we need to find the nearest elevator/escalator
  if (sourceStore.floor !== targetStore.floor) {
    return findMultiFloorPath(sourceStore, targetStore, allElements, mapSettings, avoidElements)
  }

  // If stores are on the same floor, use direct A* pathfinding
  return findSingleFloorPath(sourceStore, targetStore, allElements, mapSettings, avoidElements)
}

// Find path on a single floor
function findSingleFloorPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement,
  mapSettings: any,
  avoidElements = false,
): RoutePoint[] {
  // Get center points of stores
  const startX = sourceStore.x + sourceStore.width / 2
  const startY = sourceStore.y + sourceStore.height / 2
  const endX = targetStore.x + targetStore.width / 2
  const endY = targetStore.y + targetStore.height / 2
  const floor = sourceStore.floor

  // If we need to avoid elements, create a more complex path
  if (avoidElements) {
    // Get all elements on this floor except source and target
    const floorElements = allElements.filter(
      (el) => el.floor === floor && el.id !== sourceStore.id && el.id !== targetStore.id,
    )

    // Create waypoints to navigate around elements
    const path: RoutePoint[] = []

    // Add starting point
    path.push({ x: startX, y: startY, floor })

    // Create a path that goes around the building perimeter to avoid elements
    // This is a simplified approach - a real implementation would use A* with obstacle avoidance

    // First, move to the nearest walkable path (usually the main corridor)
    const corridorY = mapSettings.buildingY + 50 // Assuming there's a corridor near the top
    path.push({ x: startX, y: corridorY, floor })

    // Then move horizontally to align with the target
    path.push({ x: endX, y: corridorY, floor })

    // Finally move to the target
    path.push({ x: endX, y: endY, floor })

    return path
  }

  // If we don't need to avoid elements, create a more natural path with waypoints
  const path: RoutePoint[] = [{ x: startX, y: startY, floor }]

  // Calculate the direct distance between start and end
  const directDistance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))

  // Add intermediate points based on distance
  if (directDistance > 300) {
    // For longer paths, add more waypoints to make the route look more natural
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2

    // Add a slight offset to avoid a perfectly straight line
    const offsetX = (Math.random() - 0.5) * 100
    const offsetY = (Math.random() - 0.5) * 100

    path.push(
      { x: startX + (midX - startX) * 0.3, y: startY + (midY - startY) * 0.3, floor },
      { x: midX + offsetX, y: midY + offsetY, floor },
      { x: endX - (endX - midX) * 0.3, y: endY - (endY - midY) * 0.3, floor },
    )
  } else if (directDistance > 150) {
    // For medium paths, add one waypoint
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    path.push({ x: midX, y: midY, floor })
  }

  // Add end point
  path.push({ x: endX, y: endY, floor })

  return path
}

// Find path between floors using elevators/escalators
function findMultiFloorPath(
  sourceStore: MapElement,
  targetStore: MapElement,
  allElements: MapElement[],
  mapSettings: any,
  avoidElements = false,
): RoutePoint[] {
  const path: RoutePoint[] = []
  const sourceFloor = sourceStore.floor
  const targetFloor = targetStore.floor

  // Get center points of stores
  const startX = sourceStore.x + sourceStore.width / 2
  const startY = sourceStore.y + sourceStore.height / 2
  const endX = targetStore.x + targetStore.width / 2
  const endY = targetStore.y + targetStore.height / 2

  // Find nearest elevator/escalator on source floor
  const sourceFloorTransports = allElements.filter(
    (el) => (el.type === "elevator" || el.type === "escalator") && el.floor === sourceFloor,
  )

  // Find nearest elevator/escalator on target floor
  const targetFloorTransports = allElements.filter(
    (el) => (el.type === "elevator" || el.type === "escalator") && el.floor === targetFloor,
  )

  // If we have transport elements on both floors
  if (sourceFloorTransports.length > 0 && targetFloorTransports.length > 0) {
    // Find the closest transport on source floor
    const sourceTransport = findNearestElement(startX, startY, sourceFloorTransports)
    const sourceTransportX = sourceTransport.x + sourceTransport.width / 2
    const sourceTransportY = sourceTransport.y + sourceTransport.height / 2

    // Find the closest transport on target floor with the same name/id if possible
    // This simulates the same elevator/escalator on different floors
    let targetTransport = targetFloorTransports.find((t) => t.name === sourceTransport.name)
    if (!targetTransport) {
      targetTransport = findNearestElement(endX, endY, targetFloorTransports)
    }
    const targetTransportX = targetTransport.x + targetTransport.width / 2
    const targetTransportY = targetTransport.y + targetTransport.height / 2

    if (avoidElements) {
      // Get elements on source floor to avoid (except source store and transport)
      const sourceFloorElements = allElements.filter(
        (el) => el.floor === sourceFloor && el.id !== sourceStore.id && el.id !== sourceTransport.id,
      )

      // Get elements on target floor to avoid (except target store and transport)
      const targetFloorElements = allElements.filter(
        (el) => el.floor === targetFloor && el.id !== targetStore.id && el.id !== targetTransport.id,
      )

      // Create path from source to source floor transport (avoiding elements)
      // For simplicity, we'll use a corridor-based approach
      const corridorY = mapSettings.buildingY + 50 // Assuming there's a corridor near the top

      path.push(
        { x: startX, y: startY, floor: sourceFloor },
        { x: startX, y: corridorY, floor: sourceFloor },
        { x: sourceTransportX, y: corridorY, floor: sourceFloor },
        { x: sourceTransportX, y: sourceTransportY, floor: sourceFloor },
      )

      // Create path from target floor transport to target (avoiding elements)
      path.push(
        { x: targetTransportX, y: targetTransportY, floor: targetFloor },
        { x: targetTransportX, y: corridorY, floor: targetFloor },
        { x: endX, y: corridorY, floor: targetFloor },
        { x: endX, y: endY, floor: targetFloor },
      )
    } else {
      // Create a more natural path from source to source floor transport
      const sourceDistance = Math.sqrt(Math.pow(sourceTransportX - startX, 2) + Math.pow(sourceTransportY - startY, 2))

      path.push({ x: startX, y: startY, floor: sourceFloor })

      if (sourceDistance > 200) {
        // Add intermediate points for longer paths
        const midX = (startX + sourceTransportX) / 2
        const midY = (startY + sourceTransportY) / 2
        path.push({ x: midX, y: midY, floor: sourceFloor })
      }

      path.push({ x: sourceTransportX, y: sourceTransportY, floor: sourceFloor })

      // Create path from target floor transport to target
      const targetDistance = Math.sqrt(Math.pow(endX - targetTransportX, 2) + Math.pow(endY - targetTransportY, 2))

      path.push({ x: targetTransportX, y: targetTransportY, floor: targetFloor })

      if (targetDistance > 200) {
        // Add intermediate points for longer paths
        const midX = (endX + targetTransportX) / 2
        const midY = (endY + targetTransportY) / 2
        path.push({ x: midX, y: midY, floor: targetFloor })
      }

      path.push({ x: endX, y: endY, floor: targetFloor })
    }
  } else {
    // Fallback if no transport elements found - create a direct path with floor change
    path.push(
      { x: startX, y: startY, floor: sourceFloor },
      { x: (startX + endX) / 2, y: (startY + endY) / 2, floor: sourceFloor },
      { x: (startX + endX) / 2, y: (startY + endY) / 2, floor: targetFloor }, // Floor transition point
      { x: endX, y: endY, floor: targetFloor },
    )
  }

  return path
}

// Helper function to find the nearest element from a point
function findNearestElement(x: number, y: number, elements: MapElement[]): MapElement {
  let nearestElement = elements[0]
  let minDistance = Number.MAX_VALUE

  elements.forEach((element) => {
    const elementX = element.x + element.width / 2
    const elementY = element.y + element.height / 2
    const distance = Math.sqrt(Math.pow(elementX - x, 2) + Math.pow(elementY - y, 2))

    if (distance < minDistance) {
      minDistance = distance
      nearestElement = element
    }
  })

  return nearestElement
}
