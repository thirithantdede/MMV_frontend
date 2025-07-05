"use client"

import { lazy, Suspense, useEffect, useState } from "react"
import { Building, } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserNav } from "@/components/user-nav"
import { Select, SelectContent, SelectValue, SelectItem, SelectTrigger } from "@/components/ui/select"
import useQuery from "@/hooks/use-query"
import Overview from "./sub_module/over-view"


const Analysis = lazy(() => import("./sub_module/analysis"))

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("analysis")
  const [dateRange, setDateRange] = useState("month")
  const [timeRange, setTimeRange] = useState("month")

  const handleSelectChange = (value: string, type: "date" | "time") => {
    if (type === "date") {
      setDateRange(value)
    } else {
      setTimeRange(value)
    }
  }


  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          <h1 className="text-lg font-semibold">MMV Dashboard</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            Back to Editor
          </Button>
          <UserNav />
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 pt-6 sm:p-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

          {/* drop down for select ( 1 day, 1 week, 1 month ( default selected 1 month )) */}
          <div className="flex items-center gap-2">
            <Select defaultValue={dateRange} onValueChange={(value) => handleSelectChange(value, "date")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a date range" />
              </SelectTrigger>
              <SelectContent defaultValue={dateRange}>
                <SelectItem value="day">1d</SelectItem>
                <SelectItem value="week">7d</SelectItem>
                <SelectItem value="month">30d</SelectItem>
                <SelectItem value="year">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <Overview dateRange={dateRange} timeRange={timeRange} handleSelectChange={handleSelectChange} />
            
          {activeTab === "analysis" && (
            <Suspense fallback={<div>Loading...</div>}>
              <Analysis dateRange={dateRange} timeRange={timeRange} handleSelectChange={handleSelectChange} />
            </Suspense>
          )}
        </Tabs>
      </main>
    </div>
  )
}
