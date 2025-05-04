"use client"

import { lazy } from "@/utils/lazy-load"

// Lazy load the dialogs that aren't needed immediately
export const LazyRouteDialog = lazy(() =>
  import("@/components/route-dialog").then((mod) => ({ default: mod.RouteDialog })),
)
export const LazyElementDetails = lazy(() =>
  import("@/components/guest-mode/element-details").then((mod) => ({ default: mod.ElementDetails })),
)
export const LazyEventsPanel = lazy(() =>
  import("@/components/events/events-panel").then((mod) => ({ default: mod.EventsPanel })),
)
export const LazyPromotionsList = lazy(() =>
  import("@/components/guest-mode/promotions-list").then((mod) => ({ default: mod.PromotionsList })),
)
