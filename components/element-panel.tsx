"use client"

import type React from "react"

import { memo } from "react"
import { useDrag } from "react-dnd"
import {
  Store,
  CableCarIcon as Elevator,
  CableCarIcon as Escalator,
  Sofa,
  Coffee,
  ShoppingBag,
  Utensils,
  RouteIcon as Road,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface DraggableElementProps {
  type: string
  name: string
  icon: React.ReactNode
  color?: string
  defaultWidth?: number
  defaultHeight?: number
}

// Memoize the draggable element for better performance
const DraggableElement = memo(
  ({ type, name, icon, color = "#e2e8f0", defaultWidth = 100, defaultHeight = 100 }: DraggableElementProps) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: type,
      item: { type, name, color, defaultWidth, defaultHeight },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }))

    return (
      <div
        ref={drag}
        className={`flex cursor-grab items-center gap-2 rounded-md border p-2 ${isDragging ? "opacity-50" : ""}`}
        style={{ backgroundColor: color }}
      >
        {icon}
        <span>{name}</span>
      </div>
    )
  },
)

DraggableElement.displayName = "DraggableElement"

export function ElementPanel() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-medium">Quick Add</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="justify-start">
            <Store className="mr-2 h-4 w-4" />
            Store
          </Button>
          <Button variant="outline" className="justify-start">
            <Elevator className="mr-2 h-4 w-4" />
            Elevator
          </Button>
          <Button variant="outline" className="justify-start">
            <Escalator className="mr-2 h-4 w-4" />
            Escalator
          </Button>
          <Button variant="outline" className="justify-start">
            <Sofa className="mr-2 h-4 w-4" />
            Seating
          </Button>
          <Button variant="outline" className="justify-start">
            <Road className="mr-2 h-4 w-4" />
            Pathway
          </Button>
        </div>
      </div>

      <Separator />

      <Accordion type="multiple" defaultValue={["stores", "facilities"]}>
        <AccordionItem value="stores">
          <AccordionTrigger>Store Types</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-2 pt-2">
              <DraggableElement
                type="store"
                name="Retail Store"
                icon={<ShoppingBag className="h-4 w-4" />}
                color="#f1f5f9"
                defaultWidth={120}
                defaultHeight={80}
              />
              <DraggableElement
                type="store"
                name="Restaurant"
                icon={<Utensils className="h-4 w-4" />}
                color="#fee2e2"
                defaultWidth={100}
                defaultHeight={100}
              />
              <DraggableElement
                type="store"
                name="Cafe"
                icon={<Coffee className="h-4 w-4" />}
                color="#e0f2fe"
                defaultWidth={80}
                defaultHeight={60}
              />
              <DraggableElement
                type="store"
                name="Anchor Store"
                icon={<Store className="h-4 w-4" />}
                color="#f0fdf4"
                defaultWidth={200}
                defaultHeight={150}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="facilities">
          <AccordionTrigger>Facilities</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-2 pt-2">
              <DraggableElement
                type="elevator"
                name="Elevator"
                icon={<Elevator className="h-4 w-4" />}
                color="#fef3c7"
                defaultWidth={40}
                defaultHeight={40}
              />
              <DraggableElement
                type="escalator"
                name="Escalator"
                icon={<Escalator className="h-4 w-4" />}
                color="#fef3c7"
                defaultWidth={60}
                defaultHeight={30}
              />
              <DraggableElement
                type="room"
                name="Restroom"
                icon={<Sofa className="h-4 w-4" />}
                color="#e0e7ff"
                defaultWidth={80}
                defaultHeight={60}
              />
              <DraggableElement
                type="room"
                name="Seating Area"
                icon={<Sofa className="h-4 w-4" />}
                color="#dbeafe"
                defaultWidth={100}
                defaultHeight={80}
              />
              <DraggableElement
                type="pathway"
                name="Pathway"
                icon={<Road className="h-4 w-4" />}
                color="#f0f9ff"
                defaultWidth={100}
                defaultHeight={20}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
