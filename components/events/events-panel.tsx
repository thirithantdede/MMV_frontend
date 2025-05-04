"use client"

import { useState, useMemo } from "react"
import { CalendarDays, Plus, Edit, Trash2, Clock, Building, User, Tag, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useMapEditor } from "@/context/map-editor-context"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { MapElement } from "@/types"

interface EventsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEvent?: (event: Partial<MapElement>) => void
  isGuestMode?: boolean
}

export function EventsPanel({ open, onOpenChange, onAddEvent, isGuestMode = false }: EventsPanelProps) {
  const { elements, currentFloor, updateElement, removeElement } = useMapEditor()
  const [showAddEventDialog, setShowAddEventDialog] = useState(false)
  const [showEditEventDialog, setShowEditEventDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [editingEvent, setEditingEvent] = useState<MapElement | null>(null)

  // New event form state
  const [newEvent, setNewEvent] = useState<Partial<MapElement>>({
    name: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
    start_time: "09:00",
    end_time: "18:00",
    is_active: true,
    host: "",
    company: "",
    is_foc: false,
    eventDescription: "",
    type: "event",
    color: "#ddd6fe",
    floor: currentFloor,
  })

  // Filter events from all elements
  const eventElements = useMemo(() => {
    return elements.filter((element) => element.type === "event")
  }, [elements])

  // Categorize events
  const { upcomingEvents, activeEvents, pastEvents } = useMemo(() => {
    const now = new Date()

    const upcoming: MapElement[] = []
    const active: MapElement[] = []
    const past: MapElement[] = []

    eventElements.forEach((event) => {
      if (!event.start_date || !event.end_date) return

      const startDate = new Date(event.start_date)
      const endDate = new Date(event.end_date)

      if (startDate > now) {
        upcoming.push(event)
      } else if (endDate < now) {
        past.push(event)
      } else if (event.is_active) {
        active.push(event)
      } else {
        past.push(event)
      }
    })

    // Sort upcoming events by start date (ascending)
    upcoming.sort((a, b) => {
      if (!a.start_date || !b.start_date) return 0
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    })

    // Sort active events by end date (ascending)
    active.sort((a, b) => {
      if (!a.end_date || !b.end_date) return 0
      return new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
    })

    // Sort past events by start date (descending)
    past.sort((a, b) => {
      if (!a.start_date || !b.start_date) return 0
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    })

    return { upcomingEvents: upcoming, activeEvents: active, pastEvents: past }
  }, [eventElements])

  const handleAddEvent = () => {
    if (onAddEvent && newEvent.name) {
      onAddEvent(newEvent)
      setShowAddEventDialog(false)
      // Reset form
      setNewEvent({
        name: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        start_time: "09:00",
        end_time: "18:00",
        is_active: true,
        host: "",
        company: "",
        is_foc: false,
        eventDescription: "",
        type: "event",
        color: "#ddd6fe",
        floor: currentFloor,
      })
    }
  }

  const handleEditEvent = () => {
    if (editingEvent) {
      updateElement(editingEvent)
      setShowEditEventDialog(false)
      setEditingEvent(null)
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      removeElement(eventId)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setNewEvent((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEditInputChange = (field: string, value: any) => {
    if (editingEvent) {
      setEditingEvent({
        ...editingEvent,
        [field]: value,
        updated_at: new Date().toISOString(),
      })
    }
  }

  const openEditDialog = (event: MapElement) => {
    setEditingEvent({ ...event })
    setShowEditEventDialog(true)
  }

  // Render event card
  const renderEventCard = (event: MapElement) => {
    const startDate = event.start_date ? new Date(event.start_date) : null
    const endDate = event.end_date ? new Date(event.end_date) : null
    const isFree = event.is_foc

    return (
      <Card key={event.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{event.name}</CardTitle>
            {isFree && <Badge variant="success">Free Entry</Badge>}
          </div>
          <CardDescription>
            {startDate && endDate
              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : "Date not specified"}
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
            {event.host && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{event.host}</span>
              </div>
            )}
            {event.company && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{event.company}</span>
              </div>
            )}
            {event.eventDescription && (
              <div className="mt-2 text-muted-foreground line-clamp-2">{event.eventDescription}</div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag className="h-3 w-3" />
            <span>Floor {event.floor}</span>
          </div>

          {/* Only show edit/delete buttons in admin mode */}
          {!isGuestMode && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => openEditDialog(event)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Events
              </DialogTitle>
              {/* Only show Add Event button in admin mode */}
              {!isGuestMode && (
                <Button size="sm" onClick={() => setShowAddEventDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex justify-between items-center mb-4">
            <div className="flex-grow">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming" className="relative">
                    Upcoming
                    {upcomingEvents.length > 0 && (
                      <span className="absolute top-0 right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {upcomingEvents.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="active" className="relative">
                    Active
                    {activeEvents.length > 0 && (
                      <span className="absolute top-0 right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {activeEvents.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[400px] mt-4">
                  <TabsContent value="upcoming" className="mt-0">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map(renderEventCard)
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No upcoming events</div>
                    )}
                  </TabsContent>

                  <TabsContent value="active" className="mt-0">
                    {activeEvents.length > 0 ? (
                      activeEvents.map(renderEventCard)
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No active events</div>
                    )}
                  </TabsContent>

                  <TabsContent value="past" className="mt-0">
                    {pastEvents.length > 0 ? (
                      pastEvents.map(renderEventCard)
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No past events</div>
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                value={newEvent.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter event name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-start-date">Start Date</Label>
                <Input
                  id="event-start-date"
                  type="date"
                  value={newEvent.start_date}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-end-date">End Date</Label>
                <Input
                  id="event-end-date"
                  type="date"
                  value={newEvent.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-start-time">Start Time</Label>
                <Input
                  id="event-start-time"
                  type="time"
                  value={newEvent.start_time}
                  onChange={(e) => handleInputChange("start_time", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-end-time">End Time</Label>
                <Input
                  id="event-end-time"
                  type="time"
                  value={newEvent.end_time}
                  onChange={(e) => handleInputChange("end_time", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-host">Host</Label>
              <Input
                id="event-host"
                value={newEvent.host}
                onChange={(e) => handleInputChange("host", e.target.value)}
                placeholder="Event Host"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-company">Company</Label>
              <Input
                id="event-company"
                value={newEvent.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Organizing Company"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="event-active">Active</Label>
                <Switch
                  id="event-active"
                  checked={newEvent.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="event-foc">Free of Charge</Label>
                <Switch
                  id="event-foc"
                  checked={newEvent.is_foc}
                  onCheckedChange={(checked) => handleInputChange("is_foc", checked)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-description">Description</Label>
              <textarea
                id="event-description"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe the event"
                value={newEvent.eventDescription}
                onChange={(e) => handleInputChange("eventDescription", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEventDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={!newEvent.name}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      {editingEvent && (
        <Dialog open={showEditEventDialog} onOpenChange={setShowEditEventDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-event-name">Event Name</Label>
                <Input
                  id="edit-event-name"
                  value={editingEvent.name}
                  onChange={(e) => handleEditInputChange("name", e.target.value)}
                  placeholder="Enter event name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-event-start-date">Start Date</Label>
                  <Input
                    id="edit-event-start-date"
                    type="date"
                    value={editingEvent.start_date}
                    onChange={(e) => handleEditInputChange("start_date", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-event-end-date">End Date</Label>
                  <Input
                    id="edit-event-end-date"
                    type="date"
                    value={editingEvent.end_date}
                    onChange={(e) => handleEditInputChange("end_date", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-event-start-time">Start Time</Label>
                  <Input
                    id="edit-event-start-time"
                    type="time"
                    value={editingEvent.start_time}
                    onChange={(e) => handleEditInputChange("start_time", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-event-end-time">End Time</Label>
                  <Input
                    id="edit-event-end-time"
                    type="time"
                    value={editingEvent.end_time}
                    onChange={(e) => handleEditInputChange("end_time", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-event-host">Host</Label>
                <Input
                  id="edit-event-host"
                  value={editingEvent.host}
                  onChange={(e) => handleEditInputChange("host", e.target.value)}
                  placeholder="Event Host"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-event-company">Company</Label>
                <Input
                  id="edit-event-company"
                  value={editingEvent.company}
                  onChange={(e) => handleEditInputChange("company", e.target.value)}
                  placeholder="Organizing Company"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-event-active">Active</Label>
                  <Switch
                    id="edit-event-active"
                    checked={editingEvent.is_active}
                    onCheckedChange={(checked) => handleEditInputChange("is_active", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-event-foc">Free of Charge</Label>
                  <Switch
                    id="edit-event-foc"
                    checked={editingEvent.is_foc}
                    onCheckedChange={(checked) => handleEditInputChange("is_foc", checked)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-event-description">Description</Label>
                <textarea
                  id="edit-event-description"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the event"
                  value={editingEvent.eventDescription}
                  onChange={(e) => handleEditInputChange("eventDescription", e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditEvent}>
                <Check className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
