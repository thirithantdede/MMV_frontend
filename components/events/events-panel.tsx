"use client"

import { useState, useMemo, useEffect } from "react"
import { CalendarDays, Clock, Building, User, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import useQuery from "@/hooks/use-query"
import { useMapEditor } from "@/context/map-editor-context"
import type { MapElement, EventElement } from "@/types"

interface EventsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventsPanel({ open, onOpenChange }: EventsPanelProps) {
  const { project } = useMapEditor()
  const [activeTab, setActiveTab] = useState("upcoming")
  const dataFetching = useQuery("/get-events/" + project.id)

  useEffect(() => {
    if (open && dataFetching?.refetch) {
      dataFetching.refetch()
    }
  }, [open, dataFetching?.refetch])

  // Ensure elements is always an array of MapElement
  const eventElements = useMemo(() => {
    if (!dataFetching?.data) return []
    if (Array.isArray(dataFetching.data?.elements)) {
      return dataFetching.data.elements as MapElement[]
    } else if (dataFetching.data?.elements && typeof dataFetching.data?.elements === "object") {
      return dataFetching.data.elements as MapElement[]
    }
    console.warn("Unexpected data format for events:", dataFetching.data)
    return []
  }, [dataFetching?.data])

  // Categorize events based on EventElement properties
  const { upcomingEvents, activeEvents, pastEvents }: { 
    upcomingEvents: MapElement[], 
    activeEvents: MapElement[], 
    pastEvents: MapElement[] 
  } = useMemo(() => {
    const now = new Date()
    const upcoming: MapElement[] = []
    const active: MapElement[] = []
    const past: MapElement[] = []

    eventElements.forEach((element) => {
      if (element.type !== "event" || !element.event) return

      const event = element.event as EventElement
      const startDate = event.start_date ? new Date(event.start_date) : null
      const endDate = event.end_date ? new Date(event.end_date) : null

      if (!startDate || !endDate) return

      if (startDate > now) {
        upcoming.push(element)
      } else if (endDate < now) {
        past.push(element)
      } else if (event.is_active) {
        active.push(element)
      } else {
        past.push(element)
      }
    })

    // Sort upcoming events by start date (ascending)
    upcoming.sort((a, b) => {
      const aStart = a.event?.start_date ? new Date(a.event.start_date).getTime() : 0
      const bStart = b.event?.start_date ? new Date(b.event.start_date).getTime() : 0
      return aStart - bStart
    })

    // Sort active events by end date (ascending)
    active.sort((a, b) => {
      const aEnd = a.event?.end_date ? new Date(a.event.end_date).getTime() : 0
      const bEnd = b.event?.end_date ? new Date(b.event.end_date).getTime() : 0
      return aEnd - bEnd
    })

    // Sort past events by start date (descending)
    past.sort((a, b) => {
      const aStart = a.event?.start_date ? new Date(a.event.start_date).getTime() : 0
      const bStart = b.event?.start_date ? new Date(b.event.start_date).getTime() : 0
      return bStart - aStart // Fixed: Correctly sort in descending order
    })

    return { upcomingEvents: upcoming, activeEvents: active, pastEvents: past }
  }, [eventElements])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isEventEndingSoon = (endDate?: string) => {
    if (!endDate) return false
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays > 0
  }

  const renderEventCard = (element: MapElement) => {
    const event = element.event as EventElement
    const startDate = event.start_date ? new Date(event.start_date) : null
    const endDate = event.end_date ? new Date(event.end_date) : null
    const isFree = event.is_foc
    const isFeatured = event.is_featured
    const isPast = endDate && endDate < new Date()

    return (
      <Card
        key={element.id}
        className="mb-4 overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:scale-[1]"
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{event.title || "Untitled Event"}</CardTitle>
            <div className="flex gap-2">
              {isFree && <Badge variant="success" className="bg-green-600 hover:bg-green-700">Free Entry</Badge>}
              {isFeatured && <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700">Featured</Badge>}
              {isPast && <Badge variant="outline" className="border-gray-400 text-gray-600">Ended</Badge>}
            </div>
          </div>
          <CardDescription className="flex items-center gap-2">
            {startDate && endDate
              ? `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`
              : "Date not specified"}
            {endDate && !isPast && isEventEndingSoon(event.end_date) && (
              <Badge variant="destructive" className="ml-2 text-xs bg-red-600 hover:bg-red-700">
                Ending Soon
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2 text-sm">
            {event.start_time && event.end_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {event.start_time} - {event.end_time}
                </span>
              </div>
            )}
            {event.hosts && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{event.hosts}</span>
              </div>
            )}
            {event.company && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{event.company}</span>
              </div>
            )}
            {event.description && (
              <div className="mt-2 bg-gradient-to-r from-primary/10 to-primary/20 p-3 rounded-lg border border-primary/20 transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/25">
                <p className="text-sm line-clamp-2">{event.description}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag className="h-3 w-3" />
            <span>Floor {element.floor}</span>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Early return if data is not ready to prevent premature access
  if (!eventElements) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col bg-gradient-to-b from-background to-background/95">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg transition-transform duration-200 hover:scale-110">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            Events
            <Badge variant="secondary" className="ml-auto bg-blue-600 text-white hover:bg-blue-700">
              {activeEvents.length} active
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {dataFetching?.isLoading ? (
            <div className="flex flex-col items-center justify-center max-h-[400px] text-center">
              <div className="p-4 bg-muted/30 rounded-full mb-4 animate-pulse">
                <CalendarDays className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Loading Events</h3>
              <p className="text-muted-foreground max-w-sm">
                Please wait while we fetch the latest events...
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-lg p-1">
                <TabsTrigger
                  value="upcoming"
                  className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                >
                  Upcoming
                  {upcomingEvents.length > 0 && (
                    <span className="absolute top-0 right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {upcomingEvents.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                >
                  Active
                  {activeEvents.length > 0 && (
                    <span className="absolute top-0 right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeEvents.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="relative data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                >
                  Past
                  {pastEvents.length > 0 && (
                    <span className="absolute top-0 right-1 bg-gray-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pastEvents.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(renderEventCard)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No upcoming events</div>
                )}
              </TabsContent>

              <TabsContent value="active" className="mt-4">
                {activeEvents.length > 0 ? (
                  activeEvents.map(renderEventCard)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No active events</div>
                )}
              </TabsContent>

              <TabsContent value="past" className="mt-4">
                {pastEvents.length > 0 ? (
                  pastEvents.map(renderEventCard)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No past events</div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}