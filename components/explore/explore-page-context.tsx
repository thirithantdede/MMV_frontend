"use client"

import { mockProjects } from "@/utils/mock-projects"
import { useState } from "react"
import DrawerSidebar from "./drawer-sidebar"
import HeroSection from "./hero-section"
import StatsOverview from "./stats-overview"
import FeaturedProjects from "./featured-projects"
import SearchFilters from "./search-filters"
import ProjectGrid from "./project-grid"


export default function ExplorePageContent() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "rating">("popular")

  // Filter projects based on search query and category
  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || project.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Sort projects based on selected sort option
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "popular") return b.visitorCount - a.visitorCount
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return b.rating - a.rating
  })

  // Featured projects (top 3 by visitor count)
  const featuredProjects = [...mockProjects].sort((a, b) => b.visitorCount - a.visitorCount).slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      <DrawerSidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="flex flex-col">
        <HeroSection onMenuClick={() => setIsDrawerOpen(true)} />

        <main className="container mx-auto px-4 py-8">
          <StatsOverview projects={mockProjects} />

          <FeaturedProjects projects={featuredProjects} />

          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <ProjectGrid projects={sortedProjects} />
        </main>
      </div>
    </div>
  )
}
