"use client"

import type React from "react"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  sortBy: "popular" | "newest" | "rating"
  onSortChange: (sort: "popular" | "newest" | "rating") => void
}

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: SearchFiltersProps) {
  const categories = ["Shopping Center", "Mall", "Outlet", "Department Store"]

  return (
    <div className="mt-8 mb-6">
      <h2 className="text-2xl font-bold mb-4">Find Projects</h2>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(selectedCategory === category ? null : category)}
              className={selectedCategory === category ? "" : "text-gray-700"}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center mt-4 text-sm">
        <span className="text-gray-500 mr-2">Sort by:</span>
        <div className="flex gap-2">
          <SortButton active={sortBy === "popular"} onClick={() => onSortChange("popular")}>
            Popular
          </SortButton>
          <SortButton active={sortBy === "newest"} onClick={() => onSortChange("newest")}>
            Newest
          </SortButton>
          <SortButton active={sortBy === "rating"} onClick={() => onSortChange("rating")}>
            Top Rated
          </SortButton>
        </div>
      </div>
    </div>
  )
}

interface SortButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function SortButton({ active, onClick, children }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm ${
        active ? "bg-gray-200 text-gray-800 font-medium" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  )
}
