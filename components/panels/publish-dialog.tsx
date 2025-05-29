"use client"

import { useCallback, useState, useRef } from "react"
import { X, Upload, Check, Globe, Tag, FileText, Eye, EyeOff, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useMapEditor } from "@/context/map-editor-context"
import { Badge } from "@/components/ui/badge"
import config from "@/config"
import useMutate from "@/hooks/use-mutate"
import { useToast } from "@/components/ui/use-toast"

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const domain = config.domain

export function PublishDialog({ open, onOpenChange }: PublishDialogProps) {
  const { mapSettings, project, updateProject } = useMapEditor()
  const { toast } = useToast()
  const [publishName, setPublishName] = useState(project.name ?? "My Mall Map")
  const [address, setAddress] = useState(project.address ?? "Yangon, Down Town")
  const [publishDescription, setPublishDescription] = useState(project.description ?? "")
  const [isPublic, setIsPublic] = useState(project.is_public ?? false)
  const [urlEndpoint, setUrlEndpoint] = useState(project.uri ?? "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [publish, { isLoading, isError, error }] = useMutate({ callback: undefined })

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a JPEG, JPG, or PNG image.",
        })
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Image size must be less than 2MB.",
        })
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }, [toast])

  const handleRemoveImage = useCallback(() => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handlePublish = useCallback(async () => {
    if (!publishName.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Map Name",
        description: "Please provide a map name before publishing.",
      })
      return
    }

    if (!urlEndpoint.trim()) {
      toast({
        variant: "destructive",
        title: "Missing URL Path",
        description: "Please provide a URL path before publishing.",
      })
      return
    }

    setIsPublishing(true)
    try {
      const formData = new FormData()
      formData.append("name", publishName)
      formData.append("description", publishDescription)
      formData.append("address", address)
      formData.append("is_public", isPublic ? "true" : "false")
      formData.append("uri", urlEndpoint)
      if (imageFile) {
        formData.append("photo", imageFile)
      }

      const response = await publish("publish-project", formData)

      updateProject({
        ...project,
        ...response?.data,
      })

      setIsPublished(true)
      toast({
        title: "Success",
        description: "Your map has been published successfully!",
      })

      setTimeout(() => {
        setIsPublished(false)
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Publish Failed",
        description: error?.message || "An error occurred while publishing.",
      })
    } finally {
      setIsPublishing(false)
    }
  }, [publishName, publishDescription, isPublic, urlEndpoint, imageFile, publish, updateProject, project, toast, error, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6 max-h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Publish Mall Map
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Map Information Section */}
          <div className="bg-muted/40 p-4 rounded-lg border border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">Map Information</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-5 items-center gap-4">
                <Label htmlFor="publish-name" className="col-span-1 text-sm font-medium">
                  Map Name
                </Label>
                <Input
                  id="publish-name"
                  value={publishName}
                  onChange={(e) => setPublishName(e.target.value)}
                  className="col-span-4"
                  placeholder="Enter map name"
                />
              </div>
              <div className="grid grid-cols-5 items-center gap-4">
                <Label htmlFor="url-endpoint" className="col-span-1 text-sm font-medium">
                  URL Path
                </Label>
                <div className="col-span-4 flex items-center gap-1 bg-background rounded-md border border-input px-3 focus-within:ring-2 focus-within:ring-primary">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{domain}/projects/</span>
                  <Input
                    id="url-endpoint"
                    value={urlEndpoint}
                    onChange={(e) => setUrlEndpoint(e.target.value.replace(/\s+/g, "-").toLowerCase())}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    placeholder="unique-path"
                  />
                </div>
              </div>
                <div className="grid grid-cols-5 items-center gap-4">
                  <Label htmlFor="publish-name" className="col-span-1 text-sm font-medium">
                    Address
                  </Label>
                  <Input
                    id="publish-name"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="col-span-4"
                    placeholder="Enter Location"
                  />
                </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-muted/40 p-4 rounded-lg border border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">Cover Image</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose Image
                </Button>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                {imageFile && (
                  <Button variant="ghost" onClick={handleRemoveImage} className="text-red-500 hover:text-red-600">
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
              {(imagePreview || project.photo_path)&& (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border/50">
                  <img
                    src={imagePreview || project.photo_path}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a JPEG, JPG, or PNG image (max 2MB).
              </p>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-muted/40 p-4 rounded-lg border border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">Description</h3>
            </div>
            <Textarea
              id="publish-description"
              value={publishDescription}
              onChange={(e) => setPublishDescription(e.target.value)}
              placeholder="Describe your mall map..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Visibility Section */}
          <div className="bg-muted/40 p-4 rounded-lg border border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">Visibility</h3>
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

          {/* Map Details Section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Map Details</p>
                  <Badge variant="outline" className="text-xs bg-primary/10 hover:bg-primary/20">
                    v{project.current_version ?? "1.0.0"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mapSettings.width} × {mapSettings.height} pixels • {mapSettings.building_width} ×{" "}
                  {mapSettings.building_height} building
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Last edited: {new Date(project.updated_at ?? Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || isPublished}
            className="min-w-[120px] flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <Upload className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : isPublished ? (
              <>
                <Check className="h-4 w-4" />
                Published!
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Publish
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}