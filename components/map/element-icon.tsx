"use client"

import { memo } from "react"
import {
  Store,
  CableCarIcon as Elevator,
  CableCarIcon as Escalator,
  RouteIcon as Road,
  Sofa,
  DoorOpen,
  Flag,
  CalendarDays,
  Info,
  CreditCard,
  ShieldAlert,
  Ticket,
  StepBackIcon as Stairs,
} from "lucide-react"

interface ElementIconProps {
  type: string
  className?: string
}

export const ElementIcon = memo(function ElementIcon({ type, className = "h-6 w-6" }: ElementIconProps) {
  switch (type) {
    case "store":
      return <Store className={className} />
    case "elevator":
      return <Elevator className={className} />
    case "escalator":
      return <Escalator className={className} />
    case "stairs":
      return <Stairs className={className} />
    case "pathway":
      return <Road className={className} />
    case "room":
      return <Sofa className={className} />
    case "door":
      return <DoorOpen className={className} />
    case "banner":
      return <Flag className={className} />
    case "event":
      return <CalendarDays className={className} />
    case "info":
      return <Info className={className} />
    case "atm":
      return <CreditCard className={className} />
    case "security":
      return <ShieldAlert className={className} />
    case "promotion":
      return <Ticket className={className} />
    default:
      return null
  }
})
