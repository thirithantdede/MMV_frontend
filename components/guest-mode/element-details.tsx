"use client"

import { useMemo } from "react"
import { 
  Clock, 
  Building, 
  User, 
  Tag, 
  Facebook, 
  Instagram, 
  Twitter, 
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Info,
  Star,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { ElementIcon } from "@/components/map/element-icon"
import type { EventElement, MainElement, MapElement } from "@/types"
import { storeTypes } from "@/utils/global"

interface ElementDetailsProps {
  element: MapElement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewEvents?: () => void
}

export function ElementDetails({ element, open, onOpenChange, onViewEvents }: ElementDetailsProps) {
  const isActiveEvent = useMemo(() => {
    if (!element || element.type !== "event") return false
    const eventElement = element as EventElement
    if (!eventElement.start_date || !eventElement.end_date) return false

    const now = new Date()
    const startDate = new Date(eventElement.start_date)
    const endDate = new Date(eventElement.end_date)

    return now >= startDate && now <= endDate && !!eventElement.is_active
  }, [element])

  const isStoreCurrentlyOpen = useMemo(() => {
    if (!element || element.type !== "store") return false
    if (element.is_closed) return false
    
    const shopInfo = element.shop_information
    if (!shopInfo?.opening_hours) return true
    
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
    const currentTime = now.toTimeString().slice(0, 5)
    
    if (shopInfo.closed_days && shopInfo.closed_days.includes(currentDay)) {
      return false
    }
    
    const { start, end } = shopInfo.opening_hours
    if (start && end) {
      return currentTime >= start && currentTime <= end
    }
    
    return true
  }, [element])

  const getElementTypeDescription = (type: string) => {
    const descriptions = {
      store: "Retail store offering various products and services",
      event: "Special event or activity happening at the mall",
      elevator: "Vertical transportation between floors",
      escalator: "Moving stairway connecting different levels",
      stairs: "Fixed stairway for floor-to-floor access",
      room: "Designated space for specific purposes",
      pathway: "Walking route for navigation",
      door: "Entry or exit point",
      info: "Information desk or help center",
      atm: "Automated Teller Machine for banking services",
      security: "Security checkpoint or office"
    }
    return descriptions[type as keyof typeof descriptions] || "Mall facility or service point"
  }

  const getOperatingStatus = (element: MapElement) => {
    if (storeTypes.includes(element.type)) {
      if (element.is_closed || !isStoreCurrentlyOpen) {
        return { status: "closed", label: "Currently Closed", color: "destructive", icon: XCircle }
      }
      return { status: "open", label: "Currently Open", color: "success", icon: CheckCircle2 }
    }
    if (element.type === "event") {
      if (isActiveEvent) {
        return { status: "active", label: "Event Active", color: "success", icon: Zap }
      }
      return { status: "scheduled", label: "Scheduled Event", color: "secondary", icon: Calendar }
    }
    return { status: "available", label: "Available", color: "secondary", icon: CheckCircle2 }
  }

  const renderSocialMediaLinks = (element: MapElement) => {
    const shopInfo = (element as MainElement).socialMedia || element.shop_information?.social_media
    if (!shopInfo) return null

    const socialLinks = [
      { key: 'website', icon: Globe, label: 'Website', url: shopInfo.website },
      { key: 'facebook', icon: Facebook, label: 'Facebook', url: shopInfo.facebook },
      { key: 'instagram', icon: Instagram, label: 'Instagram', url: shopInfo.instagram },
      { key: 'twitter', icon: Twitter, label: 'Twitter', url: shopInfo.twitter }
    ].filter(link => link.url)

    if (socialLinks.length === 0) return null

    return (
      <div className="pt-3 border-t">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Connect With Us</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {socialLinks.map(({ key, icon: Icon, label, url }) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => window.open(url, "_blank")}
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const renderStoreDetails = (element: MapElement) => {
    const status = getOperatingStatus(element)
    const StatusIcon = status.icon
    const hasPromotion = (element as MainElement).hasPromotion && (element as MainElement).promotionDetails

    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Status and Floor */}
          <div className="flex items-center justify-between">
            <Badge variant={status.color as any} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Floor {element.floor}
            </Badge>
          </div>

          {/* Store Closure Notice */}
          {element.is_closed && (
            <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="font-medium text-sm text-destructive">Store Notice</span>
              </div>
              <p className="text-xs text-destructive/80 mt-1">
                This store is currently closed. Please check back later or contact the store directly.
              </p>
            </div>
          )}

          {/* Current Promotion */}
          {hasPromotion && (
            <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm text-primary">Special Offer</span>
              </div>
              <p className="text-xs mb-1">{(element as MainElement).promotionDetails}</p>
              {(element as MainElement).promotionEndDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Valid until: {new Date((element as MainElement).promotionEndDate!).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Operating Hours & Category */}
          <div className="space-y-3">
            {element.shop_information?.opening_hours && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Operating Hours</span>
                </div>
                <div className="text-sm text-muted-foreground ml-6">
                  {element.shop_information.opening_hours.start || "Not specified"} - {" "}
                  {element.shop_information.opening_hours.end || "Not specified"}
                </div>
                
                {element.shop_information.closed_days && 
                element.shop_information.closed_days.length > 0 && (
                  <div className="mt-2 ml-6">
                    <span className="text-xs text-muted-foreground mb-1 block">Closed on:</span>
                    <div className="flex gap-1 flex-wrap">
                      {element.shop_information.closed_days.map((day, index) => (
                        <Badge variant="outline" className="text-xs h-5" key={index}>
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {element.shop_information?.category && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Category</span>
                </div>
                <div className="ml-6">
                  <Badge variant="secondary" className="capitalize text-xs h-5">
                    {element.shop_information.category}
                  </Badge>
                </div>
              </div>
            )}

            {element.notes && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Additional Information</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{element.notes}</p>
              </div>
            )}
          </div>

          {/* Social Media */}
          {renderSocialMediaLinks(element)}
        </CardContent>
      </Card>
    )
  }

  const renderEventDetails = (element: MapElement) => {
    const eventElement = element as EventElement
    const status = getOperatingStatus(element)
    const StatusIcon = status.icon

    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Event Status */}
          <div className="flex items-center justify-between">
            <Badge variant={status.color as any} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
              {isActiveEvent && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Floor {element.floor}
            </Badge>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            {/* Schedule */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Event Schedule</span>
              </div>
              
              <div className="space-y-1 ml-6">
                {eventElement.start_date && eventElement.end_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Dates:</span>
                    <span>
                      {new Date(eventElement.start_date).toLocaleDateString()} - {" "}
                      {new Date(eventElement.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {eventElement.start_time && eventElement.end_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Time:</span>
                    <span>{eventElement.start_time} - {eventElement.end_time}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Info */}
            <div className="space-y-2">
              {eventElement.hosts && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Host:</span>
                  <span className="font-medium">{eventElement.hosts}</span>
                </div>
              )}

              {eventElement.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Organizer:</span>
                  <span className="font-medium">{eventElement.company}</span>
                </div>
              )}

              {eventElement.is_foc !== undefined && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">Entry:</span>
                  <Badge variant={eventElement.is_foc ? "success" : "outline"} className="text-xs h-5">
                    {eventElement.is_foc ? "Free Entry" : "Paid Event"}
                  </Badge>
                </div>
              )}
            </div>

            {/* Event Description */}
            {eventElement.description && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">About This Event</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed ml-6">
                  {eventElement.description}
                </p>
              </div>
            )}
          </div>

          {/* View All Events Button */}
          <div className="pt-2 border-t">
            <Button onClick={onViewEvents} className="w-full" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View All Mall Events
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderFacilityDetails = (element: MapElement) => {
    const facilityTypes = ["elevator", "escalator", "stairs", "room", "pathway", "door", "info", "atm", "security"]
    
    if (!facilityTypes.includes(element.type)) return null

    const getFacilityDescription = (type: string) => {
      const descriptions = {
        elevator: "Provides convenient vertical transportation between all floors of the mall.",
        escalator: "Moving stairway offering easy access between adjacent floor levels.",
        stairs: "Traditional stairway for moving between floors - great for exercise!",
        room: "Designated space that may include restrooms, offices, or other specialized facilities.",
        pathway: "Main walking route designed for easy navigation throughout the mall.",
        door: "Entry or exit point providing access to different areas of the mall.",
        info: "Information center where you can get help, directions, and mall services.",
        atm: "Automated banking services available 24/7 for your convenience.",
        security: "Security services ensuring a safe and secure shopping environment."
      }
      return descriptions[type as keyof typeof descriptions] || "Mall facility available for your convenience."
    }

    const getFacilityIcon = (type: string) => {
      const icons = {
        elevator: Building,
        escalator: Building,
        stairs: Building,
        room: MapPin,
        pathway: MapPin,
        door: MapPin,
        info: Info,
        atm: DollarSign,
        security: AlertCircle
      }
      return icons[type as keyof typeof icons] || MapPin
    }

    const FacilityIcon = getFacilityIcon(element.type)

    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Facility Type Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="flex items-center gap-1 capitalize">
              <FacilityIcon className="h-3 w-3" />
              {element.type}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Floor {element.floor}
            </Badge>
          </div>

          {/* Facility Description */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">About This Facility</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed ml-6">
              {getFacilityDescription(element.type)}
            </p>
          </div>

          {/* Accessibility Information */}
          {(element.type === "elevator" || element.type === "escalator" || element.type === "stairs") && (
            <div className="p-2 rounded-md bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-800">Accessibility</span>
              </div>
              <div className="text-sm text-blue-700">
                {element.type === "elevator" && "Wheelchair accessible and suitable for all mobility needs."}
                {element.type === "escalator" && "Please use caution. Elevator available for wheelchair access."}
                {element.type === "stairs" && "Manual stairs only. Please use elevator for wheelchair access."}
              </div>
            </div>
          )}

          {/* Operating Status for ATM/Info */}
          {(element.type === "atm" || element.type === "info") && (
            <div className="p-2 rounded-md bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm text-green-800">Service Status</span>
              </div>
              <div className="text-sm text-green-700">
                {element.type === "atm" && "Available 24/7 during mall operating hours."}
                {element.type === "info" && "Staff available during mall operating hours to assist you."}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {element.notes && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-1">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Additional Information</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed ml-6">{element.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!element) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ElementIcon type={element.type} className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{element.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {getElementTypeDescription(element.type)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-3" />

        <div className="space-y-4">
          {storeTypes.includes(element.type) && renderStoreDetails(element)}
          {element.type === "event" && renderEventDetails(element)}
          {["elevator", "escalator", "stairs", "room", "pathway", "door", "info", "atm", "security"].includes(
            element.type
          ) && renderFacilityDetails(element)}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
