import { notFound } from "next/navigation"
import { mockProjects } from "@/utils/mock-projects"

interface ProjectPageProps {
  params: {
    slug: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = mockProjects.find((p) => p.slug === params.slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-blue-100">{project.location}</p>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Project Details</h2>
          <p className="mb-4">{project.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-500">Category</div>
              <div className="font-medium">{project.category}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-500">Stores</div>
              <div className="font-medium">{project.storeCount}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-500">Floors</div>
              <div className="font-medium">{project.floors}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-500">Rating</div>
              <div className="font-medium">{project.rating.toFixed(1)}/5.0</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Interactive Map</h2>
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500">Interactive mall map would be displayed here</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 p-4 border-t">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Shopping Mall Map Explorer
        </div>
      </footer>
    </div>
  )
}
