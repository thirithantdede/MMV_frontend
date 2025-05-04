"use client"

import { memo } from "react"
import { Building2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMapEditor } from "@/context/map-editor-context"

export const BuildingFootprintToolbar = memo(function BuildingFootprintToolbar() {
  const { isEditingFootprint, setIsEditingFootprint } = useMapEditor()

  const toggleEditMode = () => {
    setIsEditingFootprint(!isEditingFootprint)
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isEditingFootprint ? "default" : "outline"}
              size="sm"
              onClick={toggleEditMode}
              className={isEditingFootprint ? "bg-primary text-primary-foreground" : ""}
            >
              {isEditingFootprint ? (
                <>
                  <X className="mr-1 h-4 w-4" />
                  Exit Editor
                </>
              ) : (
                <>
                  <Building2 className="mr-1 h-4 w-4" />
                  Edit Building
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isEditingFootprint ? "Exit building footprint editor" : "Edit building footprint"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
})
