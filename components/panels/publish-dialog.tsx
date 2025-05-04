"use client"

import { useState } from "react"
import { X, Upload, Check, Globe, Tag, FileText, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useMapEditor } from "@/context/map-editor-context"
import { Badge } from "@/components/ui/badge"

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PublishDialog({ open, onOpenChange }: PublishDialogProps) {
  const { mapSettings } = useMapEditor()
  const [publishName, setPublishName] = useState("My Mall Map")
  const [publishDescription, setPublishDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [urlEndpoint, setUrlEndpoint] = useState("my-mall-map")
  const [currentVersion, setCurrentVersion] = useState("1.0.0")

  const handlePublish = () => {
    setIsPublishing(true)

    // Simulate publishing process
    setTimeout(() => {
      setIsPublishing(false)
      setIsPublished(true)

      // Reset after showing success
      setTimeout(() => {
        setIsPublished(false)
        onOpenChange(false)
      }, 2000)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Publish Mall Map
          </DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/40 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Map Information</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-5 items-center gap-4">
                <Label htmlFor="publish-name" className="col-span-1 text-sm">
                  Map Name
                </Label>
                <div className="col-span-4">
                  <Input id="publish-name" value={publishName} onChange={(e) => setPublishName(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-5 items-center gap-4">
                <Label htmlFor="url-endpoint" className="col-span-1 text-sm">
                  URL Path
                </Label>
                <div className="col-span-4 flex items-center gap-1 bg-background rounded-md border border-input px-3 focus-within:ring-1 focus-within:ring-ring">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">mall-maps.com/</span>
                  <Input
                    id="url-endpoint"
                    value={urlEndpoint}
                    onChange={(e) => setUrlEndpoint(e.target.value.replace(/\s+/g, "-").toLowerCase())}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/40 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Description</h3>
            </div>

            <Textarea
              id="publish-description"
              value={publishDescription}
              onChange={(e) => setPublishDescription(e.target.value)}
              placeholder="Describe your mall map..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="bg-muted/40 p-4 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Visibility</h3>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPublic ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-amber-500" />}
                <div>
                  <p className="text-sm font-medium">{isPublic ? "Public" : "Private"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isPublic ? "Anyone with the link can view" : "Only you can view"}
                  </p>
                </div>
              </div>
              <Switch id="publish-public" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Map Details</p>
                  <Badge variant="outline" className="text-xs bg-primary/10 hover:bg-primary/20">
                    v{currentVersion}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mapSettings.width} × {mapSettings.height} pixels • {mapSettings.buildingWidth} ×{" "}
                  {mapSettings.buildingHeight} building
                </p>
              </div>
              <div className="text-xs text-muted-foreground">Last edited: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || isPublished || !publishName.trim()}
            className="min-w-[120px]"
          >
            {isPublishing ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : isPublished ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Published!
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
