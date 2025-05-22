import { useEffect, useRef } from "react";
import { useMapEditor } from "@/context/map-editor-context";
import { useCallback } from "react";


export function useHandleBehavior() {
    const containerRef = useRef<HTMLDivElement>(null)

    const { zoomLevel, setZoomLevel } = useMapEditor()

    const touchStartRef = useRef<{ x1: number; y1: number; x2: number; y2: number; dist: number } | null>(null)

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0]
            const touch2 = e.touches[1]
            const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)

            touchStartRef.current = {
                x1: touch1.clientX,
                y1: touch1.clientY,
                x2: touch2.clientX,
                y2: touch2.clientY,
                dist,
            }
        }
    }, [])

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (e.touches.length === 2 && touchStartRef.current) {
                e.preventDefault() // Prevent default browser behavior (like page zoom)

                const touch1 = e.touches[0]
                const touch2 = e.touches[1]
                const currentDist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
                const initialDist = touchStartRef.current.dist

                const zoomDelta = (currentDist - initialDist) * 0.01
                setZoomLevel((prev) => Math.max(0.3, Math.min(3, prev + zoomDelta)))

                touchStartRef.current.dist = currentDist
            }
        },
        [setZoomLevel],
    )

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault()
                const delta = e.deltaY > 0 ? -0.1 : 0.1
                setZoomLevel((prev) => Math.max(0.3, Math.min(3, prev + delta)))
            }
        },
        [setZoomLevel],
    )


    // Center the map when zoom changes
    useEffect(() => {
        if (containerRef.current) {
            const container = containerRef.current
            const scrollWidth = container.scrollWidth
            const scrollHeight = container.scrollHeight
            const clientWidth = container.clientWidth
            const clientHeight = container.clientHeight

            // Center the scroll position
            container.scrollLeft = (scrollWidth - clientWidth) / 2
            container.scrollTop = (scrollHeight - clientHeight) / 2
        }
    }, [zoomLevel])


    const handleTouchEnd = useCallback(() => {
        touchStartRef.current = null
    }, [])
    // Set up event listeners for wheel and touch events
    useEffect(() => {
        const container = containerRef.current
        if (container) {
            // Add passive: false to prevent default browser zoom behavior
            container.addEventListener("wheel", handleWheel, { passive: false })
            container.addEventListener("touchstart", handleTouchStart, { passive: false })
            container.addEventListener("touchmove", handleTouchMove, { passive: false })
            container.addEventListener("touchend", handleTouchEnd)

            return () => {
                container.removeEventListener("wheel", handleWheel)
                container.removeEventListener("touchstart", handleTouchStart)
                container.removeEventListener("touchmove", handleTouchMove)
                container.removeEventListener("touchend", handleTouchEnd)
            }
        }
    }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd])


    return { handleTouchMove, handleTouchStart, handleWheel, handleTouchEnd, containerRef }
}