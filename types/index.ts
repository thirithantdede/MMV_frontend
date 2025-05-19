export interface MapElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  name: string
  color: string
  floor: number
  rotation?: number
  opacity?: number
  borderStyle?: string
  borderRadius?: number
  category?: string
  notes?: string
  topRotation?: number
  rightRotation?: number
  bottomRotation?: number
  leftRotation?: number
  created_at?: string
  updated_at?: string
  is_foc?: boolean
  isClosed?: boolean
  walkable?: boolean
}

export interface MainElement extends MapElement {
  openHours?: string
  closedDates?: string[]
  closedDay?: string
  hasPromotion?: boolean
  promotionDetails?: string
  promotionEndDate?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    website?: string
  }
}

export interface EventElement extends MapElement {
  eventDate?: string
  eventDescription?: string
  start_date?: string
  end_date?: string
  start_time?: string
  end_time?: string
  is_active?: boolean
  host?: string
  company?: string
}

export interface MapSettings {
  width: number
  height: number
  gridSize: number
  showGrid: boolean
  // Building footprint settings
  buildingWidth: number
  buildingHeight: number
  buildingX: number
  buildingY: number
  restrictToBuilding: boolean
}

export type TransportationElementType = "elevator" | "escalator" | "stairs";

export type ElementType =
  | "store"
  | "room"
  | "pathway"
  | "door"
  | "banner"
  | "event"
  | "info"
  | "atm"
  | "security"
  | "promotion"
  | "floor"
  | TransportationElementType;


export interface DraggableItem {
  type: ElementType
  name: string
  color: string
  defaultWidth: number
  defaultHeight: number
  walkable?: boolean
}

export interface RoutePoint {
  x: number
  y: number
  floor: number
}

export interface RouteInfo {
  sourceStore: MapElement | null
  targetStore: MapElement | null
  path: RoutePoint[]
}

export interface ShopInformation {
  id: string
  name: string
  description: string
  category: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  openingHours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  website: string
  socialMedia: {
    facebook: string
    instagram: string
    twitter: string
  }
  promotions: {
    current: string
    upcoming: string
  }
  logo?: string
}


export interface User {
  id: string;
  name: string;
  email: string;
}


export interface UserGlobal {
  isAuth: boolean;
  user: null | User;
}
