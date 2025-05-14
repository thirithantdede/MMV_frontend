// localStorage utility functions for the Mall Map Editor


interface MallLayoutData {
    name: string;
    elements: any[]; // Replace `any` with a more specific type if available
    mapSettings: Record<string, any>; // Replace `any` with a more specific type if available
    currentFloor?: number;
    totalFloors?: number;
    createdAt?: string;
    updatedAt?: string;
}

export function saveMallLayout( data: MallLayoutData): boolean {
    try {
        const replace: Record<"mall-map-settings" | "mall-map-elements", any> = {
            "mall-map-settings": data.mapSettings,
            "mall-map-elements": data.elements,
        };

        // loop replace and set to localStorage
        Object.keys(replace).forEach((key) => {
            const value = replace[key as "mall-map-settings" | "mall-map-elements"];
            localStorage.setItem(key, JSON.stringify(value));
        });

        return true;
    } catch (error) {
        console.error("Error saving mall layout:", error);
        return false;
    }
}
  
 
  export function loadMallLayout(name : string) {
    try {
      const layoutData = localStorage.getItem(`mall-layout-${name}`)
      if (!layoutData) return null
  
      return JSON.parse(layoutData)
    } catch (error) {
      console.error("Error loading mall layout:", error)
      return null
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
  
  

  export function exportMallLayout(name : string) {
    try {
      const layoutData = loadMallLayout(name)
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

  export function importLayoutFromJson(jsonData : File) {
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

        // Save the imported layout
        const success = saveMallLayout(data);

        if (success) {
          return true
        } else {
          throw new Error("Failed to save imported layout")
        }
      }
    } catch (error) {
      console.error("Error importing layout from JSON:", error)
      return false
    }
  }
  
  
  function isValidLayoutFormat(data : any): data is MallLayoutData {
    return data && data.elements !== undefined && data.mapSettings !== undefined
  }
  