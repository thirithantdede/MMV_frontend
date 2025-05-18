"use client"

import type React from "react"

import { memo, useCallback, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Facebook, Instagram, Twitter, Globe, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MainElement, MapElement } from "@/types"

interface StorePropertiesPanelProps {
  element: MainElement
  onPropertyChange: (property: string, value: any) => void
}

export const StorePropertiesPanel = memo(function StorePropertiesPanel({
  element,
  onPropertyChange,
}: StorePropertiesPanelProps) {
  // Memoize closed days to prevent recreation on each render
  const closedDays = [
    { value: "none", label: "None" },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ]

  // Memoize store categories to prevent recreation on each render
  const storeCategories = [
    { value: "retail", label: "Retail" },
    { value: "food", label: "Food & Beverage" },
    { value: "service", label: "Services" },
    { value: "entertainment", label: "Entertainment" },
    { value: "luxury", label: "Luxury" },
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion" },
  ]

  // Optimize handlers with useCallback
  const handleOpenHoursChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("openHours", e.target.value),
    [onPropertyChange],
  )

  const handleIsClosedChange = useCallback(
    (checked: boolean) => onPropertyChange("isClosed", checked),
    [onPropertyChange],
  )

  const handleClosedDayChange = useCallback((value: string) => onPropertyChange("closedDay", value), [onPropertyChange])

  const handleCategoryChange = useCallback((value: string) => onPropertyChange("category", value), [onPropertyChange])

  // New handlers for promotion and social media
  const handleHasPromotionChange = useCallback(
    (checked: boolean) => onPropertyChange("hasPromotion", checked),
    [onPropertyChange],
  )

  const handlePromotionDetailsChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => onPropertyChange("promotionDetails", e.target.value),
    [onPropertyChange],
  )

  const handlePromotionEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPropertyChange("promotionEndDate", e.target.value),
    [onPropertyChange],
  )

  // State for social media dialog
  const [showSocialMediaDialog, setShowSocialMediaDialog] = useState(false)
  const [tempSocialMedia, setTempSocialMedia] = useState<MainElement['socialMedia']>(element.socialMedia || {})

  // Update temporary social media state
  const handleTempSocialMediaChange = useCallback((platform: string, value: string) => {
    setTempSocialMedia((prev) => ({
      ...prev,
      [platform]: value,
    }))
  }, [])

  // Apply social media changes
  const handleApplySocialMedia = useCallback(() => {
    onPropertyChange("socialMedia", tempSocialMedia)
    setShowSocialMediaDialog(false)
  }, [tempSocialMedia, onPropertyChange])

  // Update temp social media when element changes
  useEffect(() => {
    setTempSocialMedia(element.socialMedia || {})
  }, [element.socialMedia])

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-2">
        <Label htmlFor="store-hours">Opening Hours</Label>
        <Input
          id="store-hours"
          placeholder="e.g. 10:00 AM - 9:00 PM"
          value={element.openHours || ""}
          onChange={handleOpenHoursChange}
        />
        <p className="text-xs text-muted-foreground">Format: 10:00 AM - 9:00 PM</p>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="store-closed">Store Closed</Label>
          <Switch id="store-closed" checked={element.isClosed || false} onCheckedChange={handleIsClosedChange} />
        </div>
        <p className="text-xs text-muted-foreground">Closed stores will appear grayed out on the map</p>
      </div>

      <div className="grid gap-2 mt-4">
        <Label htmlFor="store-closed-days">Closed Days</Label>
        <Select value={element.closedDay || "sunday"} onValueChange={handleClosedDayChange}>
          <SelectTrigger id="store-closed-days">
            <SelectValue placeholder="Select closed day" />
          </SelectTrigger>
          <SelectContent>
            {closedDays.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Day when the store is regularly closed</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="store-category">Store Category</Label>
        <Select value={element.category || "retail"} onValueChange={handleCategoryChange}>
          <SelectTrigger id="store-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {storeCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      {/* Promotion Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="store-has-promotion">Has Promotion</Label>
          <Switch
            id="store-has-promotion"
            checked={element.hasPromotion || false}
            onCheckedChange={handleHasPromotionChange}
          />
        </div>

        {element.hasPromotion && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="promotion-end-date">Promotion End Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="promotion-end-date"
                  type="date"
                  value={element.promotionEndDate || ""}
                  onChange={handlePromotionEndDateChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="promotion-details">Promotion Details</Label>
              <textarea
                id="promotion-details"
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe the promotion"
                value={element.promotionDetails || ""}
                onChange={handlePromotionDetailsChange}
              />
            </div>
          </>
        )}
      </div>

      <Separator className="my-4" />

      {/* Social Media Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Social Media Links</h3>
          <Button variant="outline" size="sm" onClick={() => setShowSocialMediaDialog(true)}>
            Edit Links
          </Button>
        </div>

        {/* Preview of social media links */}
        {element.socialMedia && Object.keys(element.socialMedia).some((key) => element.socialMedia?.[key]) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {element.socialMedia.website && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Website
              </Badge>
            )}
            {element.socialMedia.facebook && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Facebook className="h-3 w-3" />
                Facebook
              </Badge>
            )}
            {element.socialMedia.instagram && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Instagram className="h-3 w-3" />
                Instagram
              </Badge>
            )}
            {element.socialMedia.twitter && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Twitter className="h-3 w-3" />
                Twitter
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Social Media Dialog */}
      <Dialog open={showSocialMediaDialog} onOpenChange={setShowSocialMediaDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Social Media Links</DialogTitle>
            <DialogDescription>
              Add social media links for {element.name}. These will be visible to mall visitors.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="social-website">Website</Label>
                <Input
                  id="social-website"
                  placeholder="https://example.com"
                  value={tempSocialMedia!.website || ""}
                  onChange={(e) => handleTempSocialMediaChange("website", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="social-facebook">Facebook</Label>
                <Input
                  id="social-facebook"
                  placeholder="https://facebook.com/storename"
                  value={tempSocialMedia!.facebook || ""}
                  onChange={(e) => handleTempSocialMediaChange("facebook", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="social-instagram">Instagram</Label>
                <Input
                  id="social-instagram"
                  placeholder="https://instagram.com/storename"
                  value={tempSocialMedia!.instagram || ""}
                  onChange={(e) => handleTempSocialMediaChange("instagram", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="social-twitter">Twitter</Label>
                <Input
                  id="social-twitter"
                  placeholder="https://twitter.com/storename"
                  value={tempSocialMedia!.twitter || ""}
                  onChange={(e) => handleTempSocialMediaChange("twitter", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSocialMediaDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplySocialMedia}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})
