"use client"

import type React from "react"

import { memo, useMemo } from "react"
import { useDrag } from "react-dnd"
import {
  Store,
  CableCarIcon as Elevator,
  CableCarIcon as Escalator,
  Sofa,
  Coffee,
  ShoppingBag,
  Utensils,
  DoorOpen,
  CalendarDays,
  Info,
  CreditCard,
  ShieldAlert,
  StepBackIcon as Stairs,
} from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { DraggableItem } from "@/types"

interface DraggableElementProps {
  item: DraggableItem
  icon: React.ReactNode
}

// Memoized draggable element component
const DraggableElement = memo(function DraggableElement({ item, icon }: DraggableElementProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: item.type,
    item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`flex cursor-grab items-center gap-2 rounded-md border p-2 select-none ${isDragging ? "opacity-50" : ""}`}
      style={{ backgroundColor: item.color }}
    >
      {icon}
      <span className="pointer-events-none">{item.name}</span>
    </div>
  )
})

// Store elements data - moved outside component to prevent recreation on each render
const storeElements: Array<DraggableItem & { icon: React.ReactNode }> = [
  {
    type: "store",
    name: "Retail Store",
    icon: <ShoppingBag className="h-4 w-4" />,
    color: "#f1f5f9",
    defaultWidth: 120,
    defaultHeight: 80,
  },
  {
    type: "store",
    name: "Restaurant",
    icon: <Utensils className="h-4 w-4" />,
    color: "#fee2e2",
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    type: "store",
    name: "Cafe",
    icon: <Coffee className="h-4 w-4" />,
    color: "#e0f2fe",
    defaultWidth: 80,
    defaultHeight: 60,
  },
  {
    type: "store",
    name: "Anchor Store",
    icon: <Store className="h-4 w-4" />,
    color: "#f0fdf4",
    defaultWidth: 200,
    defaultHeight: 150,
  },
  {
    type: "store",
    name: "Food Court Stall",
    icon: <Utensils className="h-4 w-4" />,
    color: "#ffedd5",
    defaultWidth: 60,
    defaultHeight: 40,
  },
  {
    type: "store",
    name: "Kiosk",
    icon: <ShoppingBag className="h-4 w-4" />,
    color: "#dbeafe",
    defaultWidth: 40,
    defaultHeight: 40,
  },
]

// Facility elements data - moved outside component
const facilityElements: Array<DraggableItem & { icon: React.ReactNode }> = [
  {
    type: "elevator",
    name: "Elevator",
    icon: <Elevator className="h-4 w-4" />,
    color: "#fef3c7",
    defaultWidth: 40,
    defaultHeight: 40,
  },
  {
    type: "stairs",
    name: "Stairs",
    icon: <Stairs className="h-4 w-4" />,
    color: "#fef3c7",
    defaultWidth: 60,
    defaultHeight: 40,
  },
  {
    type: "escalator",
    name: "Escalator",
    icon: <Escalator className="h-4 w-4" />,
    color: "#fef3c7",
    defaultWidth: 60,
    defaultHeight: 40,
  },
  {
    type: "room",
    name: "Restroom",
    icon: <Sofa className="h-4 w-4" />,
    color: "#e0e7ff",
    defaultWidth: 80,
    defaultHeight: 60,
  },
  {
    type: "door",
    name: "Door",
    icon: <DoorOpen className="h-4 w-4" />,
    color: "#fef9c3",
    defaultWidth: 40,
    defaultHeight: 10,
  },
  {
    type: "info",
    name: "Information Desk",
    icon: <Info className="h-4 w-4" />,
    color: "#e0f2fe",
    defaultWidth: 60,
    defaultHeight: 40,
  },
  {
    type: "atm",
    name: "ATM",
    icon: <CreditCard className="h-4 w-4" />,
    color: "#f1f5f9",
    defaultWidth: 30,
    defaultHeight: 20,
  },
  {
    type: "security",
    name: "Security Office",
    icon: <ShieldAlert className="h-4 w-4" />,
    color: "#fee2e2",
    defaultWidth: 60,
    defaultHeight: 50,
  },
]

// Marketing elements data - moved outside component
const marketingElements: Array<DraggableItem & { icon: React.ReactNode }> = [
  {
    type: "event",
    name: "Event Space",
    icon: <CalendarDays className="h-4 w-4" />,
    color: "#ddd6fe",
    defaultWidth: 180,
    defaultHeight: 150,
  },
]

// Memoized element list component
const ElementList = memo(function ElementList({ items }: { items: Array<DraggableItem & { icon: React.ReactNode }> }) {
  return (
    <div className="grid gap-2 pt-2">
      {items.map((item) => (
        <DraggableElement key={item.name} item={item} icon={item.icon} />
      ))}
    </div>
  )
})

export function ElementPanel() {
  // Use default values for accordion to prevent unnecessary re-renders
  const defaultOpenSections = useMemo(() => ["stores", "facilities", "marketing"], [])

  return (
    <div className="space-y-4 h-full flex flex-col">
      <Accordion type="multiple" defaultValue={defaultOpenSections} className="flex-1 overflow-hidden">
        <AccordionItem value="stores">
          <AccordionTrigger>Store Types</AccordionTrigger>
          <AccordionContent className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            <ElementList items={storeElements} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="facilities">
          <AccordionTrigger>Facilities</AccordionTrigger>
          <AccordionContent className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            <ElementList items={facilityElements} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="marketing">
          <AccordionTrigger>Marketing & Events</AccordionTrigger>
          <AccordionContent className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            <ElementList items={marketingElements} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded-md">
        <p>Drag elements from the panels above onto the map to add them.</p>
        <p className="mt-1">Blank spaces are automatically treated as walkable paths for routing.</p>
      </div>
    </div>
  )
}
