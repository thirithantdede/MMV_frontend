// localStorage utility functions for the Mall Map Editor

/**
 * Save mall layout to localStorage
 * @param {string} name - Name of the layout
 * @param {Object} data - Layout data including elements, settings, etc.
 */
interface MallLayoutData {
    name: string;
    elements: any[]; // Replace `any` with a more specific type if available
    mapSettings: Record<string, any>; // Replace `any` with a more specific type if available
    currentFloor?: number;
    totalFloors?: number;
    createdAt?: string;
    updatedAt?: string;
}

export function saveMallLayout(name: string, data: MallLayoutData): boolean {
    try {
        // Create a standardized format for saving
        const layoutData: MallLayoutData = {
            name: name,
            elements: data.elements || [],
            mapSettings: data.mapSettings || {},
            currentFloor: data.currentFloor || 1,
            totalFloors: data.totalFloors || 1,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save to localStorage
        localStorage.setItem(`mall-layout-${name}`, JSON.stringify(layoutData));

        // Update the list of available layouts
        updateLayoutsList(name);

        return true;
    } catch (error) {
        console.error("Error saving mall layout:", error);
        return false;
    }
}
  
  /**
   * Load mall layout from localStorage
   * @param {string} name - Name of the layout to load
   * @returns {Object|null} - The layout data or null if not found
   */
  export function loadMallLayout(name) {
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
   * Delete mall layout from localStorage
   * @param {string} name - Name of the layout to delete
   */
  export function deleteMallLayout(name) {
    try {
      localStorage.removeItem(`mall-layout-${name}`)
  
      // Update the list of available layouts
      const layouts = getAvailableLayouts()
      const updatedLayouts = layouts.filter((layout) => layout !== name)
      localStorage.setItem("mall-layouts-list", JSON.stringify(updatedLayouts))
  
      return true
    } catch (error) {
      console.error("Error deleting mall layout:", error)
      return false
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
  
  /**
   * Update the list of available layouts
   * @param {string} name - Name of the layout to add to the list
   */
  function updateLayoutsList(name) {
    try {
      const layouts = getAvailableLayouts()
      if (!layouts.includes(name)) {
        layouts.push(name)
        localStorage.setItem("mall-layouts-list", JSON.stringify(layouts))
      }
    } catch (error) {
      console.error("Error updating layouts list:", error)
    }
  }
  
  /**
   * Initialize default layouts if they don't exist
   * This loads the predefined layouts from the public/data folder
   */
  export async function initializeDefaultLayouts() {
    try {
      const layouts = getAvailableLayouts()
  
      // Only initialize if no layouts exist
      if (layouts.length === 0) {
        // Load default layouts from JSON files
        const defaultLayouts = [
          { name: "modern-shopping-center", file: "/data/modern-shopping-center.json" },
          { name: "boutique-mall", file: "/data/boutique-mall.json" },
          { name: "mega-mall", file: "/data/mega-mall.json" },
        ]
  
        for (const layout of defaultLayouts) {
          try {
            const response = await fetch(layout.file)
            if (!response.ok) {
              throw new Error(`Failed to fetch ${layout.file}: ${response.status}`)
            }
  
            const data = await response.json()
            saveMallLayout(layout.name, data)
            console.log(`Initialized default layout: ${layout.name}`)
          } catch (fetchError) {
            console.error(`Error loading default layout ${layout.name}:`, fetchError)
          }
        }
  
        // Set the first layout as active
        if (defaultLayouts.length > 0) {
          setActiveLayout(defaultLayouts[0].name)
        }
      }
    } catch (error) {
      console.error("Error initializing default layouts:", error)
    }
  }
  
  /**
   * Set the active layout
   * @param {string} name - Name of the layout to set as active
   */
  export function setActiveLayout(name) {
    try {
      localStorage.setItem("mall-active-layout", name)
      return true
    } catch (error) {
      console.error("Error setting active layout:", error)
      return false
    }
  }
  
  /**
   * Get the active layout name
   * @returns {string|null} - Name of the active layout or null if none
   */
  export function getActiveLayout() {
    try {
      return localStorage.getItem("mall-active-layout")
    } catch (error) {
      console.error("Error getting active layout:", error)
      return null
    }
  }
  
  /**
   * Export mall layout to JSON file
   * @param {string} name - Name of the layout to export
   */
  export function exportMallLayout(name) {
    try {
      const layoutData = loadMallLayout(name)
      if (!layoutData) {
        throw new Error(`Layout "${name}" not found`)
      }
  
      // Create a Blob with the JSON data
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
  
  /**
   * Import mall layout from JSON file
   * @param {File} file - JSON file to import
   * @returns {Promise<boolean>} - Success status
   */
  export async function importMallLayout(file) {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
  
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result)
  
            // Validate the data structure
            if (!data.elements || !data.mapSettings) {
              throw new Error("Invalid layout format: missing required fields")
            }
  
            // Generate a name based on the file name or use a timestamp
            const fileName = file.name.replace(/\.json$/, "")
            const name = fileName || `imported-layout-${Date.now()}`
  
            // Save the imported layout
            const success = saveMallLayout(name, data)
  
            if (success) {
              // Set as active layout
              setActiveLayout(name)
              resolve(true)
            } else {
              reject(new Error("Failed to save imported layout"))
            }
          } catch (parseError) {
            reject(new Error(`Error parsing layout file: ${parseError.message}`))
          }
        }
  
        reader.onerror = () => {
          reject(new Error("Error reading layout file"))
        }
  
        reader.readAsText(file)
      })
    } catch (error) {
      console.error("Error importing mall layout:", error)
      return false
    }
  }
  
  /**
   * Load the current active layout into the application
   * This sets the elements and settings in localStorage for the app to use
   */
  export function loadActiveLayoutIntoApp() {
    try {
      const activeName = getActiveLayout()
      if (!activeName) {
        console.warn("No active layout found")
        return false
      }
  
      const layoutData = loadMallLayout(activeName)
      if (!layoutData) {
        console.error(`Active layout "${activeName}" not found`)
        return false
      }
  
      // Set the elements and settings in localStorage for the app to use
      localStorage.setItem("mall-map-elements", JSON.stringify(layoutData.elements || []))
      localStorage.setItem("mall-map-settings", JSON.stringify(layoutData.mapSettings || {}))
  
      return true
    } catch (error) {
      console.error("Error loading active layout into app:", error)
      return false
    }
  }
  
  /**
   * Save the current app state as a layout
   * @param {string} name - Name to save the layout as
   */
  export function saveAppStateAsLayout(name) {
    try {
      // Get current app state from localStorage
      const elements = JSON.parse(localStorage.getItem("mall-map-elements") || "[]")
      const mapSettings = JSON.parse(localStorage.getItem("mall-map-settings") || "{}")
  
      // Create layout data
      const layoutData = {
        elements,
        mapSettings,
        currentFloor: 1, // Default values, app should override these
        totalFloors: 3,
        createdAt: new Date().toISOString(),
      }
  
      // Save as layout
      return saveMallLayout(name, layoutData)
    } catch (error) {
      console.error("Error saving app state as layout:", error)
      return false
    }
  }
  
  /**
   * Import layout from raw JSON data
   * @param {string} jsonData - JSON string containing layout data
   * @param {string} name - Name to save the layout as
   * @returns {boolean} - Success status
   */
  export function importLayoutFromJson(jsonData, name) {
    try {
      // Parse the JSON data
      const data = JSON.parse(jsonData)
  
      // Validate the data structure
      if (!data.elements || !data.mapSettings) {
        throw new Error("Invalid layout format: missing required fields")
      }
  
      // Generate a name if not provided
      const layoutName = name || `imported-layout-${Date.now()}`
  
      // Save the imported layout
      const success = saveMallLayout(layoutName, data)
  
      if (success) {
        // Set as active layout
        setActiveLayout(layoutName)
        return true
      } else {
        throw new Error("Failed to save imported layout")
      }
    } catch (error) {
      console.error("Error importing layout from JSON:", error)
      return false
    }
  }
  
  /**
   * Checks if the layout data has the required format
   * @param {object} data - The layout data to validate
   * @returns {boolean} - True if the layout is valid, false otherwise
   */
  function isValidLayoutFormat(data) {
    return data && data.elements !== undefined && data.mapSettings !== undefined
  }
  