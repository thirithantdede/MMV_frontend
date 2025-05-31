import { Project } from "@/types"
import ProjectCard from "./project-card"


interface ProjectGridProps {
  projects: Project[]
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">All Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
