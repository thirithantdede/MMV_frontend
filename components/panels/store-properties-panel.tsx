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
import type { MapElement, ShopInformation } from "@/types"
import TimeRangePicker from "../ui/time-range-picker"

interface StorePropertiesPanelProps {
  element: MapElement
  onPropertyChange: (property: keyof ShopInformation, value: any) => void
}

// Memoized constants
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

const storeCategories = [

  {
    "id": 1,
    "name": "Retail",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 2,
    "name": "Food",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 3,
    "name": "Drink",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 4,
    "name": "Service",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 5,
    "name": "Other",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 6,
    "name": "Mobile Phone",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 7,
    "name": "Computer",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 8,
    "name": "Furniture",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 9,
    "name": "Electronics",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 10,
    "name": "Clothing",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 11,
    "name": "Beauty",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 12,
    "name": "Health",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 13,
    "name": "Sports",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 14,
    "name": "Travel",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 15,
    "name": "Home",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 16,
    "name": "Garden",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 17,
    "name": "Pet",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 18,
    "name": "Automotive",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 19,
    "name": "Music",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 20,
    "name": "Book",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 21,
    "name": "Movie",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 22,
    "name": "Game",
    "created_at": null,
    "updated_at": null
  },
  {
    "id": 23,
    "name": "Toy",
    "created_at": null,
    "updated_at": null
  },
]


// Custom debounce function
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export const StorePropertiesPanel = memo(function StorePropertiesPanel({
  element,
  onPropertyChange,
}: StorePropertiesPanelProps) {
  const shopInfo = element.shop_information || {
    id: element.id,
    name: element.name,
    description: "",
    category: "retail",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    is_foc: false,
    opening_hours: { start: "", end: "" },
    closed_days: [],
    website: "",
    store_category_id: 0,
    social_media: {},
    promotions: { is_now: false, end_date: "", detail: "" },
  }

  const handleOpeningHourChange = useCallback(
    (value: { start: string; end: string }) => {
      onPropertyChange("opening_hours", value)
    },
    [onPropertyChange],
  )

  const handleIsFocChange = useCallback(
    (checked: boolean) => {
      onPropertyChange("is_foc", checked)
    },
    [onPropertyChange],
  )

  const handleClosedDayChange = useCallback(
    (value: string) => {
      const newClosedDays = value === "none" ? [] : [value]
      onPropertyChange("closed_days", newClosedDays)
    },
    [onPropertyChange],
  )

  const handleCategoryChange = useCallback(
    (value: string) => {
      onPropertyChange("category", value)
      onPropertyChange("store_category_id", storeCategories.find(cat => cat.name === value)?.id || 0)
    },
    [onPropertyChange],
  )

  const handleHasPromotionChange = useCallback(
    (checked: boolean) => {
      onPropertyChange("promotions", {
        ...shopInfo.promotions,
        is_now: checked,
      })
    },
    [onPropertyChange, shopInfo.promotions],
  )

  const handlePromotionDetailsChange = useCallback(
    debounce((value: string) => {
      onPropertyChange("promotions", {
        ...shopInfo.promotions,
        detail: value,
      })
    }, 300),
    [onPropertyChange, shopInfo.promotions],
  )

  const handlePromotionEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPropertyChange("promotions", {
        ...shopInfo.promotions,
        end_date: e.target.value,
      })
    },
    [onPropertyChange, shopInfo.promotions],
  )

  const [showSocialMediaDialog, setShowSocialMediaDialog] = useState(false)
  const [tempSocialMedia, setTempSocialMedia] = useState(shopInfo.social_media)

  const handleTempSocialMediaChange = useCallback((platform: keyof ShopInformation['social_media'], value: string) => {
    setTempSocialMedia((prev) => ({
      ...prev,
      [platform]: value,
    }))
  }, [])

  const handleApplySocialMedia = useCallback(() => {
    onPropertyChange("social_media", tempSocialMedia)
    setShowSocialMediaDialog(false)
  }, [tempSocialMedia, onPropertyChange])

  useEffect(() => {
    setTempSocialMedia(shopInfo.social_media)
  }, [shopInfo.social_media])

  return (
    <div className="space-y-6 pt-4">
      <div className="grid gap-3">
        <Label htmlFor="opening-hours">Opening Hours</Label>
        <TimeRangePicker
          value={shopInfo.opening_hours}
          onChange={handleOpeningHourChange}
        />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="store-foc">Free of Charge</Label>
          <Switch
            id="store-foc"
            checked={shopInfo.is_foc}
            onCheckedChange={handleIsFocChange}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enable if the store offers free services
        </p>
      </div>

      <div className="grid gap-3">
        <Label htmlFor="store-closed-days">Closed Days</Label>
        <Select
          value={Array.isArray(shopInfo.closed_days) && shopInfo.closed_days.length > 0 ? shopInfo.closed_days[0] : "none"}
          onValueChange={handleClosedDayChange}
        >
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
        <p className="text-xs text-muted-foreground">
          Day when the store is regularly closed
        </p>
      </div>

      <div className="grid gap-3">
        <Label htmlFor="store-category">Store Category</Label>
        <Select
          value={shopInfo.category}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger id="store-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {storeCategories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="store-has-promotion">Has Promotion</Label>
          <Switch
            id="store-has-promotion"
            checked={shopInfo.promotions.is_now}
            onCheckedChange={handleHasPromotionChange}
          />
        </div>

        {shopInfo.promotions.is_now && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="promotion-end-date">Promotion End Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="promotion-end-date"
                  type="date"
                  value={shopInfo.promotions.end_date}
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
                defaultValue={shopInfo.promotions.detail}
                onBlur={(e) => handlePromotionDetailsChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Social Media Links</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSocialMediaDialog(true)}
          >
            Edit Links
          </Button>
        </div>

        {Object.keys(shopInfo.social_media).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {shopInfo.social_media.website && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Website
              </Badge>
            )}
            {shopInfo.social_media.facebook && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Facebook className="h-3 w-3" />
                Facebook
              </Badge>
            )}
            {shopInfo.social_media.instagram && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Instagram className="h-3 w-3" />
                Instagram
              </Badge>
            )}
            {shopInfo.social_media.twitter && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Twitter className="h-3 w-3" />
                Twitter
              </Badge>
            )}
          </div>
        )}
      </div>

      <Dialog open={showSocialMediaDialog} onOpenChange={setShowSocialMediaDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Social Media Links</DialogTitle>
            <DialogDescription>
              Add social media links for {element.name}. These will be visible to mall visitors.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="social-website">Website</Label>
              <Input
                id="social-website"
                placeholder="https://example.com"
                value={tempSocialMedia.website || ""}
                onChange={(e) => handleTempSocialMediaChange("website", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="social-facebook">Facebook</Label>
              <Input
                id="social-facebook"
                placeholder="https://facebook.com/storename"
                value={tempSocialMedia.facebook || ""}
                onChange={(e) => handleTempSocialMediaChange("facebook", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="social-instagram">Instagram</Label>
              <Input
                id="social-instagram"
                placeholder="https://instagram.com/storename"
                value={tempSocialMedia.instagram || ""}
                onChange={(e) => handleTempSocialMediaChange("instagram", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="social-twitter">Twitter</Label>
              <Input
                id="social-twitter"
                placeholder="https://twitter.com/storename"
                value={tempSocialMedia.twitter || ""}
                onChange={(e) => handleTempSocialMediaChange("twitter", e.target.value)}
              />
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