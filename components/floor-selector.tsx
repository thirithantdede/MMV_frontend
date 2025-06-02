"use client"

import type React from "react"

import { memo, useCallback } from "react"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMapEditor } from "@/context/map-editor-context"
import useMutate from "@/hooks/use-mutate"

interface FloorButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  tooltipText: string
}

const FloorButton = memo(function FloorButton({
  icon,
  label,
  onClick,
  disabled = false,
  tooltipText,
}: FloorButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onClick} disabled={disabled}>
            {icon}
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

export const FloorSelector = memo(function FloorSelector() {
  const { currentFloor, totalFloors, setCurrentFloor, addFloor } = useMapEditor()

   const [createNewFloor] = useMutate({ callback: undefined, navigateBack: false })


  const handleFloorUp = useCallback(() => {
    if (currentFloor < totalFloors) {
      setCurrentFloor(currentFloor + 1)
    }
  }, [currentFloor, totalFloors, setCurrentFloor])

  const handleFloorDown = useCallback(() => {
    if (currentFloor > 1) {
      setCurrentFloor(currentFloor - 1)
    }
  }, [currentFloor, setCurrentFloor])

  const handleAddFloor = useCallback(async () => {
    const newFloor = await createNewFloor("create-new-floor",{
      grid : 30
    });
    if(newFloor?.status == "success"){
       addFloor()
    }
  }, [addFloor])

  return (
    <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-md">
      <FloorButton
        icon={<ChevronDown className="h-4 w-4" />}
        label="Go down one floor"
        onClick={handleFloorDown}
        disabled={currentFloor <= 1}
        tooltipText="Go down one floor"
      />

      <div className="flex min-w-[80px] items-center justify-center px-2 font-medium">
        <span className="">Floor {currentFloor}</span> &nbsp;/ {totalFloors}
      </div>

      <FloorButton
        icon={<ChevronUp className="h-4 w-4" />}
        label="Go up one floor"
        onClick={handleFloorUp}
        disabled={currentFloor >= totalFloors}
        tooltipText="Go up one floor"
      />

      <FloorButton
        icon={<Plus className="h-4 w-4" />}
        label="Add new floor"
        onClick={handleAddFloor}
        tooltipText="Add new floor"
      />
    </div>
  )
})
