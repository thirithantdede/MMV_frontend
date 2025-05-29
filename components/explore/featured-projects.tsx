"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Project } from "@/types/project"

interface FeaturedProjectsProps {
  projects: Project[]
}

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const router = useRouter()

  if (projects.length === 0) return null

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Featured Projects</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className={`relative overflow-hidden rounded-xl ${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
            style={{ height: index === 0 ? "400px" : "200px" }}
          >
            <Image
              src={project.imageUrl || "/placeholder.svg"}
              alt={project.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center mb-1">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{project.rating.toFixed(1)}</span>
                <span className="mx-2">•</span>
                <span className="text-sm">{project.category}</span>
              </div>

              <h3 className="text-lg md:text-xl font-bold mb-1">{project.name}</h3>

              <p className="text-sm text-gray-200 mb-3 line-clamp-2">{project.description}</p>

              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                onClick={() => router.push(`/project/${project.slug}`)}
              >
                Explore
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="absolute top-3 right-3 bg-blue-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
              Featured
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
