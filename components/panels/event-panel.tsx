import { EventElement } from "@/types"
import { memo, useCallback, useMemo } from "react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"

// Event-specific properties component with enhanced fields
const EventProperties = memo(function EventProperties({
    element,
    onPropertyChange,
  }: {
    element: EventElement
    onPropertyChange: (property: string, value: any) => void
  }) {
    // Optimize handlers with useCallback
    const handleStartDateChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("start_date", e.target.value),
      [onPropertyChange],
    )
  
    const handleEndDateChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("end_date", e.target.value),
      [onPropertyChange],
    )
  
    const handleStartTimeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("start_time", e.target.value),
      [onPropertyChange],
    )
  
    const handleEndTimeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("end_time", e.target.value),
      [onPropertyChange],
    )
  
    const handleIsActiveChange = useCallback(
      (checked: boolean) => onPropertyChange("is_active", checked),
      [onPropertyChange],
    )
  
    const handleEventDescriptionChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => onPropertyChange("eventDescription", e.target.value),
      [onPropertyChange],
    )
  
    const handleHostChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("host", e.target.value),
      [onPropertyChange],
    )
  
    const handleCompanyChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("company", e.target.value),
      [onPropertyChange],
    )
  
    const handleIsFocChange = useCallback((checked: boolean) => onPropertyChange("is_foc", checked), [onPropertyChange])
  
    // Check if event is currently active
    const isCurrentlyActive = useMemo(() => {
      if (!element.start_date || !element.end_date) return false
      const now = new Date()
      const startDate = new Date(element.start_date)
      const endDate = new Date(element.end_date)
      return now >= startDate && now <= endDate && element.is_active
    }, [element.start_date, element.end_date, element.is_active])
  
    return (
      <div className="space-y-4 pt-4">
        <div className="grid gap-2">
          <Label htmlFor="event-start-date">Start Date</Label>
          <Input id="event-start-date" type="date" value={element.start_date || ""} onChange={handleStartDateChange} />
        </div>
  
        <div className="grid gap-2">
          <Label htmlFor="event-end-date">End Date</Label>
          <Input id="event-end-date" type="date" value={element.end_date || ""} onChange={handleEndDateChange} />
        </div>
  
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="event-start-time">Start Time</Label>
            <Input id="event-start-time" type="time" value={element.start_time || ""} onChange={handleStartTimeChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-end-time">End Time</Label>
            <Input id="event-end-time" type="time" value={element.end_time || ""} onChange={handleEndTimeChange} />
          </div>
        </div>
  
        <div className="grid gap-2">
          <Label htmlFor="event-host">Host</Label>
          <Input id="event-host" value={element.host || ""} onChange={handleHostChange} placeholder="Event Host" />
        </div>
  
        <div className="grid gap-2">
          <Label htmlFor="event-company">Company</Label>
          <Input
            id="event-company"
            value={element.company || ""}
            onChange={handleCompanyChange}
            placeholder="Organizing Company"
          />
        </div>
  
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="event-active">Event Active</Label>
            <Switch id="event-active" checked={element.is_active || false} onCheckedChange={handleIsActiveChange} />
          </div>
          {isCurrentlyActive && (
            <div className="bg-green-100 text-green-800 text-xs p-2 rounded-md">
              This event is currently active and will be highlighted on the map.
            </div>
          )}
        </div>
  
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="event-foc">Free of Charge</Label>
            <Switch id="event-foc" checked={element.is_foc || false} onCheckedChange={handleIsFocChange} />
          </div>
          <p className="text-xs text-muted-foreground">
            {element.is_foc ? "This event is free for all attendees" : "This event requires payment or registration"}
          </p>
        </div>
  
        <div className="grid gap-2">
          <Label htmlFor="event-description">Event Description</Label>
          <textarea
            id="event-description"
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Describe the event"
            value={element.eventDescription || ""}
            onChange={handleEventDescriptionChange}
          />
        </div>
  
        <div className="text-xs text-muted-foreground">
          Last updated: {element.updated_at ? new Date(element.updated_at).toLocaleString() : "Never"}
        </div>
      </div>
    )
  })

  export default EventProperties;