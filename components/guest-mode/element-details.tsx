"use client"

import { useMemo } from "react"
import { Clock, Building, User, Tag, X, Facebook, Instagram, Twitter, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ElementIcon } from "@/components/map/element-icon"
import type { EventElement, MainElement, MapElement } from "@/types"

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

  const renderSocialMediaLinks = (element: MapElement) => {
    const shopInfo = (element as MainElement).socialMedia || element.shop_information?.social_media
    if (!shopInfo) return null

    return (
      <div className="flex gap-2 mt-4">
        {shopInfo.website && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(shopInfo.website, "_blank")}
          >
            <Globe className="h-4 w-4" />
            <span className="sr-only">Website</span>
          </Button>
        )}
        {shopInfo.facebook && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(shopInfo.facebook, "_blank")}
          >
            <Facebook className="h-4 w-4" />
            <span className="sr-only">Facebook</span>
          </Button>
        )}
        {shopInfo.instagram && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(shopInfo.instagram, "_blank")}
          >
            <Instagram className="h-4 w-4" />
            <span className="sr-only">Instagram</span>
          </Button>
        )}
        {shopInfo.twitter && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(shopInfo.twitter, "_blank")}
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
          </div>
        </DialogHeader>

        <div className="py-4">
          {element.type === "store" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {element.shop_information?.opening_hours?.start || "Hours not specified"} -{" "}
                  {element.shop_information?.opening_hours?.end || "Hours not specified"}
                </span>
              </div>

              {element.shop_information?.closed_days && 
              element.shop_information.closed_days.length > 0 && (
                <div className="flex items-center gap-2">
                  Closed days:
                  {
                    element.shop_information.closed_days.map((day, index) => (
                      <Badge variant="outline" className="text-xs" key={index}>
                        {day}
                      </Badge>
                    ))
                  }
                </div>
              )}

              {element.is_closed && (
                <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">This store is currently closed.</div>
              )}

              {element.shop_information?.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{element.shop_information.category}</span>
                </div>
              )}

              {(element as MainElement).hasPromotion && (element as MainElement).promotionDetails && (
                <div className="bg-primary/10 p-3 rounded-md">
                  <p className="font-medium text-sm mb-1">Current Promotion:</p>
                  <p className="text-sm">{(element as MainElement).promotionDetails}</p>
                  {(element as MainElement).promotionEndDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Ends: {new Date((element as MainElement).promotionEndDate!).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {renderSocialMediaLinks(element)}

              {element.notes && (
                <div className="mt-4 p-3 bg-muted/30 rounded-md text-sm">
                  <p className="font-medium mb-1">Notes:</p>
                  <p>{element.notes}</p>
                </div>
              )}
            </div>
          )}

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
                {(element as EventElement).start_date && (element as EventElement).end_date && (
                  <div className="flex items-center gap-2">
                    <ElementIcon type="event" className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date((element as EventElement).start_date!).toLocaleDateString()} -{" "}
                      {new Date((element as EventElement).end_date!).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {(element as EventElement).start_time && (element as EventElement).end_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {(element as EventElement).start_time} - {(element as EventElement).end_time}
                    </span>
                  </div>
                )}

                {(element as EventElement).host && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Host: {(element as EventElement).host}</span>
                  </div>
                )}

                {(element as EventElement).company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Company: {(element as EventElement).company}</span>
                  </div>
                )}

                {(element as EventElement).is_foc !== undefined && (
                  <div className="flex items-center gap-2">
                    <Badge variant={(element as EventElement).is_foc ? "success" : "outline"}>
                      {(element as EventElement).is_foc ? "Free Entry" : "Paid Event"}
                    </Badge>
                  </div>
                )}
              </div>

              {(element as EventElement).eventDescription && (
                <div className="mt-2 p-3 bg-muted/30 rounded-md text-sm">
                  <p className="font-medium mb-1">Description:</p>
                  <p>{(element as EventElement).eventDescription}</p>
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

          {["elevator", "escalator", "stairs", "room", "pathway", "door", "info", "atm", "security"].includes(
            element.type
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