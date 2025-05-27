"use client"

import { useState, useMemo } from "react"
import { Ticket, Calendar, Facebook, Instagram, Twitter, Globe, MapPin, Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useMapEditor } from "@/context/map-editor-context"
import type { MapElement } from "@/types"

interface PromotionsListProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStoreSelect?: (store: MapElement) => void
}

export function PromotionsList({ open, onOpenChange, onStoreSelect }: PromotionsListProps) {
  const { elements } = useMapEditor()
  const [selectedPromotion, setSelectedPromotion] = useState<MapElement | null>(null)
  const [showPromotionDetails, setShowPromotionDetails] = useState(false)

  // Filter stores with active promotions
  const storesWithPromotions = useMemo(() => {
    return elements.filter(
      (element) => element.type === "store" && element.shop_information?.promotions.is_now && !element.is_closed,
    ) as MapElement[]
  }, [elements])

  // Sort by promotion end date (soonest ending first)
  const sortedPromotions = useMemo(() => {
    return [...storesWithPromotions].sort((a, b) => {
      if (!a.shop_information?.promotions.end_date || !b.shop_information?.promotions.end_date) return 0
      return (
        new Date(a.shop_information?.promotions.end_date).getTime() -
        new Date(b.shop_information?.promotions.end_date).getTime()
      )
    })
  }, [storesWithPromotions])

  const handleViewDetails = (promotion: MapElement) => {
    setSelectedPromotion(promotion)
    setShowPromotionDetails(true)
  }

  const handleStoreSelect = (store: MapElement) => {
    if (onStoreSelect) {
      onStoreSelect(store)
      onOpenChange(false)
      setShowPromotionDetails(false)
    }
  }

  const renderSocialMediaLinks = (store: MapElement) => {
    if (!store.shop_information?.social_media) return null

    const socialLinks = [
      { icon: Globe, url: store.shop_information?.social_media.website, label: "Website" },
      { icon: Facebook, url: store.shop_information?.social_media.facebook, label: "Facebook" },
      { icon: Instagram, url: store.shop_information?.social_media.instagram, label: "Instagram" },
      { icon: Twitter, url: store.shop_information?.social_media.twitter, label: "Twitter" },
    ].filter((link) => link.url)

    if (socialLinks.length === 0) return null

    return (
      <div className="flex gap-2">
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
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isPromotionEndingSoon = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              Current Promotions
              <Badge variant="secondary" className="ml-auto">
                {sortedPromotions.length} active
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {sortedPromotions.length > 0 ? (
              <div className="space-y-4 pb-4">
                {sortedPromotions.map((store) => (
                  <Card
                    key={store.id}
                    className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-primary/20"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold">{store.name}</CardTitle>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              Floor {store.floor}
                            </div>
                            {store.shop_information?.promotions.end_date && (
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3" />
                                <span
                                  className={
                                    isPromotionEndingSoon(store.shop_information.promotions.end_date)
                                      ? "text-orange-600 font-medium"
                                      : "text-muted-foreground"
                                  }
                                >
                                  Ends {formatDate(store.shop_information.promotions.end_date)}
                                </span>
                                {isPromotionEndingSoon(store.shop_information.promotions.end_date) && (
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

                    {store.shop_information?.promotions.detail && (
                      <CardContent className="pt-0 pb-3">
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-3 rounded-lg border border-primary/10">
                          <p className="text-sm line-clamp-2 text-foreground/90">
                            {store.shop_information.promotions.detail}
                          </p>
                        </div>
                      </CardContent>
                    )}

                    <CardFooter className="pt-0 flex justify-between items-center">
                      {renderSocialMediaLinks(store)}
                      <div className="flex gap-2">
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
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          Find on Map
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="p-4 bg-muted/30 rounded-full mb-4">
                  <Ticket className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Active Promotions</h3>
                <p className="text-muted-foreground max-w-sm">
                  There are no active promotions at the moment. Check back later for exciting deals and offers!
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Promotion Details Dialog */}
      {selectedPromotion && (
        <Dialog open={showPromotionDetails} onOpenChange={setShowPromotionDetails}>
          <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-hidden">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl">{selectedPromotion.name}</DialogTitle>
              <div className="flex items-center gap-4 pt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Floor {selectedPromotion.floor}
                </Badge>
                {selectedPromotion.shop_information?.promotions.end_date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Ends {formatDate(selectedPromotion.shop_information.promotions.end_date)}
                  </div>
                )}
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-6">
                {selectedPromotion.shop_information?.promotions.detail && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Promotion Details
                    </h4>
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                      <p className="whitespace-pre-line text-sm leading-relaxed">
                        {selectedPromotion.shop_information.promotions.detail}
                      </p>
                    </div>
                  </div>
                )}

                {selectedPromotion.shop_information?.opening_hours?.start && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Opening Hours
                    </h4>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm">{selectedPromotion.shop_information.opening_hours.start}</p>
                    </div>
                  </div>
                )}

                {selectedPromotion.shop_information?.social_media && (
                  <div>
                    <h4 className="font-medium mb-3">Connect With Us</h4>
                    {renderSocialMediaLinks(selectedPromotion)}
                  </div>
                )}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <Button onClick={() => handleStoreSelect(selectedPromotion)} className="bg-primary hover:bg-primary/90">
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
