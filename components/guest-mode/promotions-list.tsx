"use client"

import { useState, useMemo } from "react"
import { Ticket, Calendar, Facebook, Instagram, Twitter, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
      (element) => element.type === "store" && element.hasPromotion && !element.isClosed,
    ) as MapElement[]
  }, [elements])

  // Sort by promotion end date (soonest ending first)
  const sortedPromotions = useMemo(() => {
    return [...storesWithPromotions].sort((a, b) => {
      if (!a.promotionEndDate || !b.promotionEndDate) return 0
      return new Date(a.promotionEndDate).getTime() - new Date(b.promotionEndDate).getTime()
    })
  }, [storesWithPromotions])

  const handleViewDetails = (promotion: MapElement) => {
    setSelectedPromotion(promotion)
    setShowPromotionDetails(true)
  }

  // Update the handleStoreSelect function to be more explicit about its purpose
  const handleStoreSelect = (store: MapElement) => {
    if (onStoreSelect) {
      onStoreSelect(store)
      onOpenChange(false) // Close the promotions dialog
      setShowPromotionDetails(false) // Close the promotion details dialog if open
    }
  }

  const renderSocialMediaLinks = (store: MapElement) => {
    if (!store.socialMedia) return null

    return (
      <div className="flex gap-2 mt-2">
        {store.socialMedia.website && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(store.socialMedia?.website, "_blank")}
          >
            <Globe className="h-4 w-4" />
            <span className="sr-only">Website</span>
          </Button>
        )}
        {store.socialMedia.facebook && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(store.socialMedia?.facebook, "_blank")}
          >
            <Facebook className="h-4 w-4" />
            <span className="sr-only">Facebook</span>
          </Button>
        )}
        {store.socialMedia.instagram && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(store.socialMedia?.instagram, "_blank")}
          >
            <Instagram className="h-4 w-4" />
            <span className="sr-only">Instagram</span>
          </Button>
        )}
        {store.socialMedia.twitter && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(store.socialMedia?.twitter, "_blank")}
          >
            <Twitter className="h-4 w-4" />
            <span className="sr-only">Twitter</span>
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Current Promotions
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            {sortedPromotions.length > 0 ? (
              <div className="space-y-4 py-4">
                {sortedPromotions.map((store) => (
                  <Card key={store.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{store.name}</CardTitle>
                        <Badge>Floor {store.floor}</Badge>
                      </div>
                      {store.promotionEndDate && (
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Ends: {new Date(store.promotionEndDate).toLocaleDateString()}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pb-2">
                      {store.promotionDetails && <p className="text-sm line-clamp-2">{store.promotionDetails}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      {renderSocialMediaLinks(store)}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(store)}>
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => handleStoreSelect(store)}>
                          Find on Map
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No active promotions at the moment</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Promotion Details Dialog */}
      {selectedPromotion && (
        <Dialog open={showPromotionDetails} onOpenChange={setShowPromotionDetails}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedPromotion.name} - Promotion Details</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <Badge>Floor {selectedPromotion.floor}</Badge>
                {selectedPromotion.promotionEndDate && (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    Ends: {new Date(selectedPromotion.promotionEndDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {selectedPromotion.promotionDetails && (
                <div className="bg-muted/30 p-4 rounded-md mb-4">
                  <p className="whitespace-pre-line">{selectedPromotion.promotionDetails}</p>
                </div>
              )}

              {selectedPromotion.openHours && (
                <div className="mb-4">
                  <p className="text-sm font-medium">Opening Hours:</p>
                  <p className="text-sm">{selectedPromotion.openHours}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-6">
                <div>{renderSocialMediaLinks(selectedPromotion)}</div>
                <Button onClick={() => handleStoreSelect(selectedPromotion)}>Find on Map</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
