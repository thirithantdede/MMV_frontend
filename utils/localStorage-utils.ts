// localStorage utility functions for the Mall Map Editor

import { parse } from "path";


interface MallLayoutData {
  name: string;
  elements: any[]; // Replace `any` with a more specific type if available
  mapSettings: Record<string, any>; // Replace `any` with a more specific type if available
  currentFloor?: number;
  totalFloors?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function saveMallLayout(data: any): boolean {
  try {
    let parsed :any = {};
    Object.keys(data).forEach((key) => {
      const value = data[key];
      localStorage.setItem(key,JSON.stringify(value));
      parsed[key] = JSON.parse(localStorage.getItem(key) || "{}");
    });
    return parsed;
  } catch (error) {
    console.error("Error saving mall layout:", error);
    return false;
  }
}

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 10) // simple random string
}

export function loadMallLayout(floors: number, encode: boolean = false) {
  try {
    const result: Record<string, any> = {};

    for (let i = 1; i <= floors; i++) {
      const key = `mall-map-elements-${i}`;
      const raw = localStorage.getItem(key);

      if (raw) {
        const parsed = JSON.parse(raw);

        const modified = parsed.map((el: any) => ({
          ...el,
          id: `new_element_${generateRandomId()}`,
          isSynced: false,
        }));

        result[key] = encode ? JSON.stringify(modified) : modified;
      }
    }

    const rawMapLayout = localStorage.getItem("mall-map-settings");
    const rawFloorElements = localStorage.getItem("floor-elements");

    if (!rawMapLayout || !rawFloorElements) {
      throw new Error("Required layout data not found in localStorage.");
    }

    const parsedMap = JSON.parse(rawMapLayout);
    const parsedFloors = JSON.parse(rawFloorElements);

    parsedMap.id = null;
    parsedMap.project_id = null;
    parsedMap.isSynced = false;

    const modifiedFloors = parsedFloors.map((el: any) => ({
      ...el,
      id: `new_element_${generateRandomId()}`,
      isSynced: false,
    }));

    result["floor-elements"] = encode ? JSON.stringify(modifiedFloors) : modifiedFloors;
    result["mall-map-settings"] = encode ? JSON.stringify(parsedMap) : parsedMap;

    return result;

  } catch (error) {
    console.error("Error loading mall layout:", error);
    return null;
  }
}




/**
 * Get list of available layouts
 * @returns {Array} - Array of layout names
 */
export function getAvailableLayouts() {
  try {
    const layouts = localStorage.getItem("mall-layouts-list")
    return layouts ? JSON.parse(layouts) : []
  } catch (error) {
    console.error("Error getting available layouts:", error)
    return []
  }
}



export function exportMallLayout(name: string, floors: number) {
  try {
    const layoutData = loadMallLayout(floors)
    if (!layoutData) {
      throw new Error(`Layout "${name}" not found`)
    }

    const blob = new Blob([JSON.stringify(layoutData, null, 2)], { type: "application/json" })

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name}.json`
    document.body.appendChild(a)
    a.click()

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 0)

    return true
  } catch (error) {
    console.error("Error exporting mall layout:", error)
    return false
  }
}

export function importLayoutFromJson(jsonData: File) {
  try {
    // Parse the JSON data
    const reader = new FileReader()
    reader.readAsText(jsonData)

    reader.onload = (event) => {
      if (!event.target || typeof event.target.result !== "string") {
        throw new Error("File read error or result is not a string");
      }
      const data = JSON.parse(event.target.result);

      // Validate the data structure
      if (!isValidLayoutFormat(data)) {
        throw new Error("Invalid layout format: missing required fields");
      }

      const success = saveMallLayout(data);

      if (success) {
        return success
      } else {
        throw new Error("Failed to save imported layout")
      }
    }
  } catch (error) {
    console.error("Error importing layout from JSON:", error)
    return false
  }
}


function isValidLayoutFormat(data: any): data is MallLayoutData {
  return data !== undefined
}
