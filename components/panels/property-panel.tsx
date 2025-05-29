"use client"

import type React from "react"
import { useState, useEffect, useCallback, memo, useMemo } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMapEditor } from "@/context/map-editor-context"
import type { EventElement, MapElement, ShopInformation } from "@/types"
import { StorePropertiesPanel } from "@/components/panels/store-properties-panel"
import GeneralProperties from "./general-tab"
import StyleProperties from "./style-tab"
import EventProperties from "./event-panel"
import AdvancedProperties from "./advanced-tab"


export function PropertyPanel() {
  const { selectedElement, updateElement, removeElement, totalFloors } = useMapEditor()
  const [elementProperties, setElementProperties] = useState<MapElement | null>(null)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    if (selectedElement) {
      setElementProperties({ ...selectedElement })
    } else {
      setElementProperties(null)
    }
  }, [selectedElement])

  // Set appropriate tab based on element type
  useEffect(() => {
    if (selectedElement) {
      if (selectedElement.type === "store") {
        setActiveTab("store")
      } else if (
        selectedElement.type === "event" ||
        selectedElement.type === "banner" ||
        selectedElement.type === "promotion"
      ) {
        setActiveTab("event")
      } else {
        setActiveTab("general")
      }
    }
  }, [selectedElement])

  const handleStoreInformationChange = useCallback(
    (property: keyof ShopInformation, value: any) => {
      setElementProperties((prev) => {
        if (!prev || prev.type !== "store") return prev

        const updatedShopInfo: any = {
          ...prev.shop_information,
          [property]: value,
        }

        const updatedElement: MapElement = {
          ...prev,
          shop_information: updatedShopInfo,
          isSynced: false,
        }

        // Notify context of changes
        updateElement(updatedElement)

        return updatedElement
      })
    },
    [updateElement]
  )

    const handlEventProperyChange = useCallback(
    (property: keyof EventElement, value: any) => {
      setElementProperties((prev) => {
        if (!prev || prev.type !== "event") return prev

        const eventInfo: any = {
          ...prev.event,
          [property]: value,
        }

        const updatedElement: MapElement = {
          ...prev,
          event: eventInfo,
          isSynced: false,
        }

        // Notify context of changes
        updateElement(updatedElement)

        return updatedElement
      })
    },
    [updateElement]
  )

  const handlePropertyChange = useCallback(
    (property: string, value: any) => {
      console.log(property)
      setElementProperties((prev) => {
        if (!prev) return null

        const updated = {
          ...prev,
          [property]: value,
          isSynced: false,
          ...(prev.type === "event" ? { updated_at: new Date().toISOString() } : {}),
        }

        // Notify context of changes
        updateElement(updated)

        return updated
      })
    },
    [updateElement],
  )

  const handleDelete = useCallback(() => {
    if (selectedElement) {
      removeElement(selectedElement.id)
    }
  }, [selectedElement, removeElement])

  if (!elementProperties) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        <p>Select an element to edit its properties</p>
      </div>
    )
  }

  // Determine which tabs to show based on element type
  const showStoreTab = elementProperties.type === "store"
  const showEventTab = ["event", "banner", "promotion"].includes(elementProperties.type)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Properties</h3>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap w-full">
          <TabsTrigger value="general" className="flex-1">
            General
          </TabsTrigger>
          <TabsTrigger value="style" className="flex-1">
            Style
          </TabsTrigger>
          {showStoreTab && (
            <TabsTrigger value="store" className="flex-1">
              Store
            </TabsTrigger>
          )}
          {showEventTab && (
            <TabsTrigger value="event" className="flex-1">
              Event
            </TabsTrigger>
          )}
          <TabsTrigger value="advanced" className="flex-1">
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralProperties element={elementProperties} onPropertyChange={handlePropertyChange} />
        </TabsContent>

        <TabsContent value="style">
          <StyleProperties element={elementProperties} onPropertyChange={handlePropertyChange} />
        </TabsContent>

        {showStoreTab && (
          <TabsContent value="store">
            <StorePropertiesPanel element={elementProperties} onPropertyChange={handleStoreInformationChange} />
          </TabsContent>
        )}

        {showEventTab && (
          <TabsContent value="event">
            <EventProperties event={elementProperties.event!} onPropertyChange={handlEventProperyChange} />
          </TabsContent>
        )}

        <TabsContent value="advanced">
          <AdvancedProperties
            element={elementProperties}
            onPropertyChange={handlePropertyChange}
            totalFloors={totalFloors}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
