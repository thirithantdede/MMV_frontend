"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Ticket, Calendar, Facebook, Instagram, Twitter, Globe, MapPin, Clock, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useMapEditor } from "@/context/map-editor-context"
import type { MapElement } from "@/types"
import useQuery from "@/hooks/use-query"
import { useIsMobile } from "@/hooks/use-mobile"

interface PromotionsListProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStoreSelect?: (store: MapElement) => void
}

interface PromotionStatus {
  isActive: boolean
  isExpired: boolean
  isEndingSoon: boolean
  daysRemaining: number
}

interface StoreStatus {
  isCurrentlyOpen: boolean
  nextOpenTime?: string
  closedReason?: string
}

export function PromotionsList({ open, onOpenChange, onStoreSelect }: PromotionsListProps) {
  const { project } = useMapEditor()
  const [selectedPromotion, setSelectedPromotion] = useState<MapElement | null>(null)
  const [showPromotionDetails, setShowPromotionDetails] = useState(false)

  const dataFetching = useQuery("/get-promotions/" + project.id)

  useEffect(() => {
    if (open && dataFetching?.refetch) {
      dataFetching.refetch()
    }
  }, [open, dataFetching?.refetch])

  // Memoized current time to avoid recalculations
  const currentTime = useMemo(() => new Date(), [open])

  // Helper function to get promotion status
  const getPromotionStatus = useCallback((endDate?: string): PromotionStatus => {
    if (!endDate) {
      return {
        isActive: true,
        isExpired: false,
        isEndingSoon: false,
        daysRemaining: Infinity
      }
    }

    const end = new Date(endDate)
    const now = new Date()
    
    // Set time to end of day for end date to be more accurate
    end.setHours(23, 59, 59, 999)
    
    const diffTime = end.getTime() - now.getTime()
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      isActive: daysRemaining > 0,
      isExpired: daysRemaining <= 0,
      isEndingSoon: daysRemaining > 0 && daysRemaining <= 3,
      daysRemaining: Math.max(0, daysRemaining)
    }
  }, [])

  // Helper function to check if store is currently open
  const getStoreStatus = useCallback((store: MapElement): StoreStatus => {
    const shopInfo = store.shop_information
    if (!shopInfo) {
      return { isCurrentlyOpen: true }
    }

    // Check if store is marked as closed
    if (store.is_closed) {
      return {
        isCurrentlyOpen: false,
        closedReason: "Temporarily closed"
      }
    }

    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase() // mon, tue, wed, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes() // minutes since midnight

    // Check closed days - handle both array and string formats
    let closedDays: string[] = []
    if (shopInfo.closed_days) {
      if (Array.isArray(shopInfo.closed_days)) {
        closedDays = shopInfo.closed_days.map(day => day.toLowerCase())
      } else if (typeof shopInfo.closed_days === 'string') {
        try {
          // Try to parse as JSON array
          const parsed = JSON.parse(shopInfo.closed_days)
          if (Array.isArray(parsed)) {
            closedDays = parsed.map(day => day.toLowerCase())
          } else {
            // Single day as string
            closedDays = [shopInfo.closed_days.toLowerCase()]
          }
        } catch {
          // Not JSON, treat as single day
          if (shopInfo.closed_days !== "none") {
            closedDays = [shopInfo.closed_days.toLowerCase()]
          }
        }
      }
    }

    // Check if today is a closed day
    const fullDayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    if (closedDays.includes(currentDay) || closedDays.includes(fullDayName)) {
      return {
        isCurrentlyOpen: false,
        closedReason: "Closed today"
      }
    }

    // Check opening hours
    if (shopInfo.opening_hours?.start && shopInfo.opening_hours?.end) {
      const [startHour, startMin] = shopInfo.opening_hours.start.split(':').map(Number)
      const [endHour, endMin] = shopInfo.opening_hours.end.split(':').map(Number)
      
      const openTime = startHour * 60 + startMin
      const closeTime = endHour * 60 + endMin

      if (currentTime < openTime) {
        return {
          isCurrentlyOpen: false,
          nextOpenTime: shopInfo.opening_hours.start,
          closedReason: "Opens later today"
        }
      } else if (currentTime > closeTime) {
        return {
          isCurrentlyOpen: false,
          closedReason: "Closed for today"
        }
      }
    }

    return { isCurrentlyOpen: true }
  }, [])

  // Process elements from server response
  const elements = useMemo(() => {
    if (!dataFetching?.data) return []
    
    try {
      // Handle direct array response
      if (Array.isArray(dataFetching.data)) {
        return dataFetching.data as MapElement[]
      }
      // Handle object with elements property
      if (Array.isArray(dataFetching.data?.elements)) {
        return dataFetching.data.elements as MapElement[]
      }
      // Handle object where elements is an object
      if (dataFetching.data?.elements && typeof dataFetching.data?.elements === "object") {
        return Object.values(dataFetching.data.elements) as MapElement[]
      }
    } catch (error) {
      console.error("Error processing promotions data:", error)
    }
    
    return []
  }, [dataFetching?.data])

  // Filter and categorize stores with promotions
  const { activePromotions, expiredPromotions } = useMemo(() => {
    const storesWithPromotions = elements.filter(
      (element: MapElement) =>
        (element.type === "store" || element.type === "cafe" || element.type === "restaurant") &&
        element.shop_information?.promotions?.detail && // Has promotion details
        element.shop_information?.promotions?.is_now === true // Promotion is currently active
    ) as MapElement[]

    const active: MapElement[] = []
    const expired: MapElement[] = []

    storesWithPromotions.forEach(store => {
      const promotionStatus = getPromotionStatus(store.shop_information?.promotions?.end_date)
      
      if (promotionStatus.isExpired) {
        expired.push(store)
      } else {
        active.push(store)
      }
    })

    return { activePromotions: active, expiredPromotions: expired }
  }, [elements, getPromotionStatus])

  // Sort active promotions by end date (soonest ending first)
  const sortedActivePromotions = useMemo(() => {
    return [...activePromotions].sort((a, b) => {
      const aEndDate = a.shop_information?.promotions?.end_date
      const bEndDate = b.shop_information?.promotions?.end_date
      
      if (!aEndDate && !bEndDate) return 0
      if (!aEndDate) return 1
      if (!bEndDate) return -1
      
      return new Date(aEndDate).getTime() - new Date(bEndDate).getTime()
    })
  }, [activePromotions])

  const handleViewDetails = useCallback((promotion: MapElement) => {
    setSelectedPromotion(promotion)
    setShowPromotionDetails(true)
  }, [])

  const handleStoreSelect = useCallback((store: MapElement) => {
    if (onStoreSelect) {
      onStoreSelect(store)
      onOpenChange(false)
      setShowPromotionDetails(false)
    }
  }, [onStoreSelect, onOpenChange])

  const renderSocialMediaLinks = useCallback((store: MapElement) => {
    const socialMedia = store.shop_information?.social_media
    if (!socialMedia || (Array.isArray(socialMedia) && socialMedia.length === 0)) return null

    const socialLinks = [
      { icon: Globe, url: socialMedia.website, label: "Website" },
      { icon: Facebook, url: socialMedia.facebook, label: "Facebook" },
      { icon: Instagram, url: socialMedia.instagram, label: "Instagram" },
      { icon: Twitter, url: socialMedia.twitter, label: "Twitter" },
    ].filter((link) => link.url)

    if (socialLinks.length === 0) return null

    return (
      <div className="flex gap-2 flex-wrap">
        {socialLinks.map(({ icon: Icon, url, label }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => window.open(url, "_blank")}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </Button>
        ))}
      </div>
    )
  }, [])

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }, [])

  const isMobile = useIsMobile()

  const renderPromotionCard = useCallback((store: MapElement) => {
    const promotionStatus = getPromotionStatus(store.shop_information?.promotions?.end_date)
    const storeStatus = getStoreStatus(store)

    return (
      <Card
        key={store.id}
        className={`overflow-hidden hover:shadow-md transition-shadow border-l-4 ${
          promotionStatus.isExpired 
            ? "border-l-red-300 opacity-75" 
            : promotionStatus.isEndingSoon 
              ? "border-l-orange-300" 
              : "border-l-primary/20"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 flex-wrap">
                <span className="mr-1">{store.name}</span>
                {!storeStatus.isCurrentlyOpen && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {storeStatus.closedReason}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  Floor {store.floor}
                </div>
                {store.shop_information?.promotions?.end_date && (
                  <div className="flex items-center gap-1 text-sm flex-wrap">
                    <Calendar className="h-3 w-3" />
                    <span
                      className={
                        promotionStatus.isExpired
                          ? "text-red-600 font-medium"
                          : promotionStatus.isEndingSoon
                            ? "text-orange-600 font-medium"
                            : "text-muted-foreground"
                      }
                    >
                      {promotionStatus.isExpired 
                        ? `Ended ${formatDate(store.shop_information.promotions.end_date)}`
                        : `Ends ${formatDate(store.shop_information.promotions.end_date)}`
                      }
                    </span>
                    {promotionStatus.isExpired && (
                      <Badge variant="destructive" className="ml-1 text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Ended
                      </Badge>
                    )}
                    {promotionStatus.isEndingSoon && !promotionStatus.isExpired && (
                      <Badge variant="destructive" className="ml-1 text-xs">
                        Ending Soon
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        {store.shop_information?.promotions?.detail && (
          <CardContent className="pt-0 pb-3">
            <div className={`p-3 rounded-lg border ${
              promotionStatus.isExpired 
                ? "bg-red-50 border-red-200" 
                : "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/10"
            }`}>
              <p className="text-sm line-clamp-2 text-foreground/90">
                {store.shop_information.promotions.detail}
              </p>
            </div>
          </CardContent>
        )}

        <CardFooter className={`pt-0 ${isMobile ? 'flex-col items-stretch gap-2' : 'flex justify-between items-center'}`}>
          {renderSocialMediaLinks(store) && (
            <div className={isMobile ? 'mb-2' : ''}>
              {renderSocialMediaLinks(store)}
            </div>
          )}
          <div className={`flex ${isMobile ? 'flex-col' : ''} gap-2`}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(store)}
              className="hover:bg-primary hover:text-primary-foreground"
            >
              View Details
            </Button>
            <Button
              size="sm"
              onClick={() => handleStoreSelect(store)}
              className="bg-primary hover:bg-primary/90"
              disabled={promotionStatus.isExpired}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Find on Map
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }, [getPromotionStatus, getStoreStatus, formatDate, renderSocialMediaLinks, handleViewDetails, handleStoreSelect, isMobile])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col w-[95vw] max-w-full p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl flex-wrap">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span>Promotions</span>
              <div className="flex gap-2 ml-auto mt-2 sm:mt-0">
                <Badge variant="secondary">
                  {sortedActivePromotions.length} active
                </Badge>
                {expiredPromotions.length > 0 && (
                  <Badge variant="outline" className="text-red-600">
                    {expiredPromotions.length} expired
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-0 sm:pr-4">
            {dataFetching?.isLoading ? (
              <div className="flex flex-col items-center justify-center max-h-[400px] text-center p-4">
                <div className="p-4 bg-muted/30 rounded-full mb-4">
                  <Ticket className="h-12 w-12 text-muted-foreground animate-pulse" />
                </div>
                <h3 className="text-lg font-medium mb-2">Loading Promotions</h3>
                <p className="text-muted-foreground max-w-sm">
                  Please wait while we fetch the latest promotions...
                </p>
              </div>
            ) : (sortedActivePromotions.length > 0 || expiredPromotions.length > 0) ? (
              <div className="space-y-6 pb-4 max-h-[400px]">
                {/* Active Promotions */}
                {sortedActivePromotions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Active Promotions ({sortedActivePromotions.length})
                    </h3>
                    {sortedActivePromotions.map(renderPromotionCard)}
                  </div>
                )}

                {/* Expired Promotions */}
                {expiredPromotions.length > 0 && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Expired Promotions ({expiredPromotions.length})
                    </h3>
                    {expiredPromotions.map(renderPromotionCard)}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                <div className="p-4 bg-muted/30 rounded-full mb-4">
                  <Ticket className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Promotions Available</h3>
                <p className="text-muted-foreground max-w-sm">
                  There are no promotions at the moment. Check back later for exciting deals and offers!
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Promotion Details Dialog */}
      {selectedPromotion && (
        <Dialog open={showPromotionDetails} onOpenChange={setShowPromotionDetails}>
          <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-scroll w-[95vw] max-w-full p-4 sm:p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl flex items-center gap-2 flex-wrap">
                <span className="mr-1">{selectedPromotion.name}</span>
                {(() => {
                  const promotionStatus = getPromotionStatus(selectedPromotion.shop_information?.promotions?.end_date)
                  const storeStatus = getStoreStatus(selectedPromotion)
                  
                  return (
                    <div className="flex gap-2 flex-wrap">
                      {promotionStatus.isExpired && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      )}
                      {promotionStatus.isEndingSoon && !promotionStatus.isExpired && (
                        <Badge variant="destructive" className="text-xs">
                          Ending Soon
                        </Badge>
                      )}
                      {!storeStatus.isCurrentlyOpen && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {storeStatus.closedReason}
                        </Badge>
                      )}
                    </div>
                  )
                })()}
              </DialogTitle>
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Floor {selectedPromotion.floor}
                </Badge>
                {selectedPromotion.shop_information?.promotions?.end_date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {(() => {
                      const promotionStatus = getPromotionStatus(selectedPromotion.shop_information?.promotions?.end_date)
                      return promotionStatus.isExpired 
                        ? `Ended ${formatDate(selectedPromotion.shop_information.promotions.end_date)}`
                        : `Ends ${formatDate(selectedPromotion.shop_information.promotions.end_date)}`
                    })()}
                  </div>
                )}
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[400px] pr-0 sm:pr-4">
              <div className="space-y-6">
                {selectedPromotion.shop_information?.promotions?.detail && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2 justify-center sm:justify-start">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Promotion Details
                    </h4>
                    <div className={`p-3 sm:p-4 rounded-lg border ${
                      getPromotionStatus(selectedPromotion.shop_information?.promotions?.end_date).isExpired
                        ? "bg-red-50 border-red-200"
                        : "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/10"
                    }`}>
                      <p className="whitespace-pre-line text-sm leading-relaxed">
                        {selectedPromotion.shop_information.promotions.detail}
                      </p>
                    </div>
                  </div>
                )}

                {selectedPromotion.shop_information?.opening_hours?.start && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2 justify-center sm:justify-start">
                      <Clock className="h-4 w-4 text-primary" />
                      Opening Hours
                    </h4>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm text-center sm:text-left">
                        {selectedPromotion.shop_information.opening_hours.start} -{" "}
                        {selectedPromotion.shop_information.opening_hours.end || "Not specified"}
                      </p>
                    </div>
                  </div>
                )}

                {(() => {
                  const shopInfo = selectedPromotion.shop_information
                  if (!shopInfo?.closed_days) return null

                  let closedDays: string[] = []
                  if (Array.isArray(shopInfo.closed_days)) {
                    closedDays = shopInfo.closed_days.filter(day => day && day !== "none")
                  } else if (typeof shopInfo.closed_days === 'string') {
                    try {
                      const parsed = JSON.parse(shopInfo.closed_days)
                      if (Array.isArray(parsed)) {
                        closedDays = parsed.filter(day => day && day !== "none")
                      } else {
                        closedDays = shopInfo.closed_days !== "none" ? [shopInfo.closed_days] : []
                      }
                    } catch {
                      closedDays = shopInfo.closed_days !== "none" ? [shopInfo.closed_days] : []
                    }
                  }

                  if (closedDays.length === 0) return null

                  return (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2 justify-center sm:justify-start">
                        <Clock className="h-4 w-4 text-primary" />
                        Closed Days
                      </h4>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-sm text-center sm:text-left">
                          Closed on {closedDays.map(day => 
                            day.charAt(0).toUpperCase() + day.slice(1)
                          ).join(', ')}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {selectedPromotion.shop_information?.social_media && (
                  <div>
                    <h4 className="font-medium mb-3 text-center sm:text-left">Connect With Us</h4>
                    <div className="flex justify-center sm:justify-start">
                      {renderSocialMediaLinks(selectedPromotion)}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <Button 
                onClick={() => handleStoreSelect(selectedPromotion)} 
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                disabled={getPromotionStatus(selectedPromotion.shop_information?.promotions?.end_date).isExpired}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Find on Map
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

