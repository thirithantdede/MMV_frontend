"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimeRangePickerProps {
  value?: { start: string; end: string }
  onChange?: (value: { start: string; end: string }) => void
  className?: string
}

export default function TimeRangePicker({ value, onChange, className }: TimeRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [startTime, setStartTime] = useState(value?.start || "09:00")
  const [endTime, setEndTime] = useState(value?.end || "17:00")

  const handleApply = () => {
    onChange?.({ start: startTime, end: endTime })
    setOpen(false)
  }

  const displayValue = value ? `${value.start} - ${value.end}` : "Select time range"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[280px] justify-start text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-time">End Time</Label>
            <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <Button onClick={handleApply} className="w-full">
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
