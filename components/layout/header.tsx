"use client"

import { memo, useCallback, useState } from "react"
import { Building, Settings, Eye, LayoutDashboard, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UserNav } from "@/components/user-nav"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LayoutManager from "@/components/layout-manager"

interface HeaderProps {
  onOpenSettings: () => void
  onOpenPublish: () => void
}

// Use React.memo to cache the header component
export const Header = memo(function Header({ onOpenSettings, onOpenPublish }: HeaderProps) {
  const router = useRouter()
  const [layoutManagerOpen, setLayoutManagerOpen] = useState(false)

  const handleEnterPreview = useCallback(() => {
    router.push("/preview")
  }, [router])

  const handleGoToDashboard = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  return (
    <header className="flex h-14 items-center border-b px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Building className="h-6 w-6" />
        <h1 className="text-lg font-semibold">MMV</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onOpenSettings}>
                <Settings className="h-4 w-4" />
                <span className="sr-only">Map Settings</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Map Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setLayoutManagerOpen(true)}>
                <Download className="h-4 w-4" />
                <span className="sr-only">Import/Export Layouts</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import/Export Layouts</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleEnterPreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview as Guest</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleGoToDashboard}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go to Dashboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button onClick={onOpenPublish}>Publish</Button>
        <UserNav />
      </div>

      {/* Layout Manager Dialog */}
      <Dialog open={layoutManagerOpen} onOpenChange={setLayoutManagerOpen}>
        <DialogContent className="sm:max-w-md">
          <LayoutManager />
        </DialogContent>
      </Dialog>
    </header>
  )
})
