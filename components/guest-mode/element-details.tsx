"use client"

import { useMemo } from "react"
import { Clock, Building, User, Tag, X, Facebook, Instagram, Twitter, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ElementIcon } from "@/components/map/element-icon"
import type { MapElement } from "@/types"

interface ElementDetailsProps {
  element: MapElement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewEvents?: () => void
}

export function ElementDetails({ element, open, onOpenChange, onViewEvents }: ElementDetailsProps) {
  // Check if event is currently active
  const isActiveEvent = useMemo(() => {
    if (!element || element.type !== "event" || !element.start_date || !element.end_date) return false

    const now = new Date()
    const startDate = new Date(element.start_date)
    const endDate = new Date(element.end_date)

    return now >= startDate && now <= endDate && element.is_active
  }, [element])

  const renderSocialMediaLinks = (element: MapElement) => {
    if (!element.socialMedia) return null

    return (
      <div className="flex gap-2 mt-4">
        {element.socialMedia.website && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(element.socialMedia?.website, "_blank")}
          >
            <Globe className="h-4 w-4" />
            <span className="sr-only">Website</span>
          </Button>
        )}
        {element.socialMedia.facebook && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(element.socialMedia?.facebook, "_blank")}
          >
            <Facebook className="h-4 w-4" />
            <span className="sr-only">Facebook</span>
          </Button>
        )}
        {element.socialMedia.instagram && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(element.socialMedia?.instagram, "_blank")}
          >
            <Instagram className="h-4 w-4" />
            <span className="sr-only">Instagram</span>
          </Button>
        )}
        {element.socialMedia.twitter && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(element.socialMedia?.twitter, "_blank")}
          >
            <Twitter className="h-4 w-4" />
            <span className="sr-only">Twitter</span>
          </Button>
        )}
      </div>
    )
  }

  if (!element) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ElementIcon type={element.type} />
              <DialogTitle>{element.name}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          {/* Store Details */}
          {element.type === "store" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{element.openHours || "Hours not specified"}</span>
              </div>

              {element.closedDay && element.closedDay !== "none" && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Closed on {element.closedDay.charAt(0).toUpperCase() + element.closedDay.slice(1)}
                  </Badge>
                </div>
              )}

              {element.isClosed && (
                <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">This store is currently closed.</div>
              )}

              {element.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{element.category}</span>
                </div>
              )}

              {/* Show promotion details if available */}
              {element.hasPromotion && element.promotionDetails && (
                <div className="bg-primary/10 p-3 rounded-md">
                  <p className="font-medium text-sm mb-1">Current Promotion:</p>
                  <p className="text-sm">{element.promotionDetails}</p>
                  {element.promotionEndDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Ends: {new Date(element.promotionEndDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Social Media Links */}
              {renderSocialMediaLinks(element)}

              {element.notes && (
                <div className="mt-4 p-3 bg-muted/30 rounded-md text-sm">
                  <p className="font-medium mb-1">Notes:</p>
                  <p>{element.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Event Details */}
          {element.type === "event" && (
            <div className="space-y-4">
              {isActiveEvent && (
                <div className="bg-green-100 text-green-800 p-2 rounded-md text-sm flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  This event is currently active.
                </div>
              )}

              <div className="flex flex-col gap-2">
                {element.start_date && element.end_date && (
                  <div className="flex items-center gap-2">
                    <ElementIcon type="event" className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(element.start_date).toLocaleDateString()} -{" "}
                      {new Date(element.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {element.start_time && element.end_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {element.start_time} - {element.end_time}
                    </span>
                  </div>
                )}

                {element.host && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Host: {element.host}</span>
                  </div>
                )}

                {element.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Company: {element.company}</span>
                  </div>
                )}

                {element.is_foc !== undefined && (
                  <div className="flex items-center gap-2">
                    <Badge variant={element.is_foc ? "success" : "outline"}>
                      {element.is_foc ? "Free Entry" : "Paid Event"}
                    </Badge>
                  </div>
                )}
              </div>

              {element.eventDescription && (
                <div className="mt-2 p-3 bg-muted/30 rounded-md text-sm">
                  <p className="font-medium mb-1">Description:</p>
                  <p>{element.eventDescription}</p>
                </div>
              )}

              <div className="mt-4">
                <Button onClick={onViewEvents} className="w-full">
                  <ElementIcon type="event" className="h-4 w-4 mr-2" />
                  View All Events
                </Button>
              </div>
            </div>
          )}

          {/* Facility Details */}
          {["elevator", "escalator", "stairs", "room", "pathway", "door", "info", "atm", "security"].includes(
            element.type,
          ) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {element.type}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>Floor {element.floor}</span>
              </div>

              {element.notes && (
                <div className="mt-4 p-3 bg-muted/30 rounded-md text-sm">
                  <p className="font-medium mb-1">Notes:</p>
                  <p>{element.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
