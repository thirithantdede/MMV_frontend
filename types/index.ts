export interface MapElement {
  id: string
  old_element_id?: string
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
  border_radius: borderRadius
  border_color: string
  border_style: string
  notes?: string
  created_at?: string
  updated_at?: string
  is_closed?: boolean
  walkable?: boolean
  isSynced : boolean
  isDeleted : boolean
  shop_information?: ShopInformation
  event?: EventElement
}

export interface Project {
  id : string,
  name : string,
  description : string
  photo : string,
  photo_path : string
  address : string
  webisite? : string
  is_published : boolean
  uri: string
  is_public : boolean
  current_version : string
  map_settings : MapSettings
  published_at : string
  updated_at : string
  elements_count : number
  user?: User
}

export interface User{
  id : string
  name : string,
  email : string,
}

export type FloorCollection = Floor[];

export interface Floor {
  id : string,
  name : string,
  level : number,
  project_id : number,
}

export interface borderRadius {
  topLeft : number
  topRight : number
  bottomRight : number
  bottomLeft : number
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

export interface EventElement  {
  title?: string
  description?: string
  start_date?: string
  end_date?: string
  start_time?: string
  end_time?: string
  company?: string
  hosts?: string
  is_active?: boolean
  is_foc?: boolean
  is_featured?: boolean

}

export interface MapSettings {
  width: number
  height: number
  grid_size: number
  show_grid: boolean
  show_opening_hours: boolean
  // Building footprint settings
  building_width: number
  building_height: number
  building_x: number
  building_y: number
  restricted: boolean
  isSynced: boolean
}

export type TransportationElementType = "elevator" | "escalator" | "stairs";

export type ElementType =
  | "store"
  | "restaurant"
  | "cafe" 
  | "anchor-store" 
  | "kisok"
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
  | "office"
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
  readable_id: string
  description: string
  category: string
  contact_person: string
  contact_email: string
  contact_phone: string
  is_foc?: boolean

  opening_hours: {
    start :string
    end : string
  } 

  closed_days: string[]
  website: string
  store_category_id: number

  social_media: {
    facebook?: string
    instagram?: string
    twitter?: string
    website?: string
  }

  promotions: {
    is_now: boolean
    end_date: string
    detail: string
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
