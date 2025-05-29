import { Project } from "@/types/project"
import { Users, Building, Star, TrendingUp } from "lucide-react"

interface StatsOverviewProps {
  projects: Project[]
}

export default function StatsOverview({ projects }: StatsOverviewProps) {
  // Calculate total stats
  const totalVisitors = projects.reduce((sum, project) => sum + project.visitorCount, 0)
  const totalStores = projects.reduce((sum, project) => sum + project.storeCount, 0)
  const averageRating = projects.reduce((sum, project) => sum + project.rating, 0) / projects.length

  const stats = [
    {
      name: "Total Projects",
      value: projects.length,
      icon: <Building className="h-5 w-5 text-blue-600" />,
      trend: "+12% from last month",
      trendUp: true,
    },
    {
      name: "Total Visitors",
      value: formatLargeNumber(totalVisitors),
      icon: <Users className="h-5 w-5 text-green-600" />,
      trend: "+8% from last month",
      trendUp: true,
    },
    {
      name: "Total Stores",
      value: formatLargeNumber(totalStores),
      icon: <Building className="h-5 w-5 text-purple-600" />,
      trend: "+5% from last month",
      trendUp: true,
    },
    {
      name: "Average Rating",
      value: averageRating.toFixed(1),
      icon: <Star className="h-5 w-5 text-yellow-500" />,
      trend: "+0.2 from last month",
      trendUp: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="bg-gray-50 p-2 rounded-md">{stat.icon}</div>
            <div className={`flex items-center text-xs ${stat.trendUp ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${stat.trendUp ? "" : "transform rotate-180"}`} />
              {stat.trend}
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.name}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}
