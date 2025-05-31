"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Users, Store, Calendar, MapPin, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Project } from "@/types"

export default function ProjectCard( {project} : {project: Project} ) {
  const router = useRouter()

  const handleViewProject = () => {
    router.push(`/projects/${project.uri}`)
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 w-full">
        <Image src={project.photo_path || "/placeholder.svg"} alt={project.name} fill className="object-cover" />
        {/* <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 text-xs font-medium flex items-center">
          <Star className="h-3 w-3 text-yellow-500 mr-1" />
          {project.rating.toFixed(1)}
        </div> */}
      </div>

      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold line-clamp-1">{project.name}</h3>
          {/* <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              project.category === "Shopping Center" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
            }`}
          >
            {project.category}
          </span> */}
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="line-clamp-1">{project.address}</span>
        </div>

        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{project.description}</p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <StatItem
            icon={<Users className="h-4 w-4 text-blue-500" />}
            label="Visitors"
            value={formatNumber(project.view_count)}
          />
          <StatItem icon={<Store className="h-4 w-4 text-green-500" />} label="Stores" value={project.elements_count} />
          <StatItem
            icon={<Calendar className="h-4 w-4 text-purple-500" />}
            label="Created"
            value={formatDate(project.published_at)}
          />
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden relative">
              <Image
                src={project.adminAvatar || "/placeholder.svg"}
                alt={project.adminName}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm text-gray-600 ml-2">
              by <span className="font-medium">{project.adminName}</span>
            </span> */}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-2"
            onClick={handleViewProject}
          >
            View Project
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: string | number
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-1">{icon}</div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-sm">{value}</div>
    </div>
  )
}

// Helper functions
function formatNumber(num: number): string {
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`
}
