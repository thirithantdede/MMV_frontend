"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  onMenuClick: () => void
}

export default function HeroSection({ onMenuClick }: HeroSectionProps) {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="absolute top-4 left-4 md:top-6 md:left-6">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-white hover:bg-white/20">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>

      <div className="container mx-auto px-4 py-16 md:pt-20 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Discover Shopping Mall Projects</h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
          Explore interactive mall maps created by our community of mall administrators. Find the perfect shopping
          destination with detailed floor plans and store information.
        </p>
  
      </div>
    </div>
  )
}
