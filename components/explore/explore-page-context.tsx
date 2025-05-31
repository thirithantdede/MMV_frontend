"use client"

import { mockProjects } from "@/utils/mock-projects"
import { useState } from "react"
import DrawerSidebar from "./drawer-sidebar"
import HeroSection from "./hero-section"
import StatsOverview from "./stats-overview"
import FeaturedProjects from "./featured-projects"
import SearchFilters from "./search-filters"
import ProjectGrid from "./project-grid"
import useQuery from "@/hooks/use-query"


export default function ExplorePageContent() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "rating">("popular")

  const projectDataQuery = useQuery('projects');

  return (
    <div className="min-h-screen bg-gray-50">
      <DrawerSidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="flex flex-col">
        <HeroSection onMenuClick={() => setIsDrawerOpen(true)} />

        <main className="container mx-auto px-4 py-4">

          {
            projectDataQuery.isLoading ? (
              <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : projectDataQuery.data ? (
              <ProjectGrid projects={projectDataQuery.data?.data} />
            ) : (
              <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500">No projects found.</p>
              </div>
            )
          }
{/* 
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          /> */}

          {/* <ProjectGrid projects={sortedProjects} /> */}
        </main>
      </div>
    </div>
  )
}
