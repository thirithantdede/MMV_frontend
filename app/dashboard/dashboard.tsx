"use client"

import { useEffect, useState } from "react"
import { Building, Users, ShoppingBag, Map } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { UserNav } from "@/components/user-nav"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectValue, SelectItem, SelectTrigger } from "@/components/ui/select"
import useQuery from "@/hooks/use-query"
import { LinerChart } from "./line-chart"

type PopularStore = {
  name : string,
  analytics_count : number,
  target : number
}

type ChartData = {
  label : string
  data : number
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState("month")
  const [timeRange, setTimeRange] = useState("month")
  const [staticData, setStaticData] = useState({
    total_event : 0,
    total_visitor : 0,
    total_active_stores : 0,
    total_route_searches : 0
  })
  const [visitorChartData,setVisitorChartData] = useState<ChartData[]>([]);
  const [popularStores,setPopularStore] = useState<PopularStore[]>([]);

  const handleSelectChange = (value: string, type: "date" | "time") => {
    if (type === "date") {
      setDateRange(value)
    } else {
      setTimeRange(value)
    }
  }

  const staticQuery = useQuery(`/dashboard/statistics?date_type=${dateRange}`);
  const popularStoreQuery = useQuery(`/dashboard/popular-stores?date_type=${dateRange}`);
  const chartDataQuery = useQuery(`/dashboard/visitor-tracks?date_type=${timeRange}`);
  

  useEffect(()=>{
    if(chartDataQuery?.data){
      setVisitorChartData(chartDataQuery.data.data);
    }
  },[chartDataQuery?.isFetching])

  useEffect(() => {
    if (staticQuery?.data) {
      setStaticData({
        total_event: staticQuery.data.data.totalEvents,
        total_visitor: staticQuery.data.data.totalVisitors,
        total_active_stores: staticQuery.data.data.totalActiveStores,
        total_route_searches: staticQuery.data.data.totalRouteSearches,
      });
    }
  }, [staticQuery?.isFetching]);

  useEffect(() => {
    if (popularStoreQuery?.data) {
      setPopularStore(popularStoreQuery.data.data);
    }

  }, [popularStoreQuery?.isFetching]);


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
         
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staticData.total_event}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staticData.total_visitor}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staticData.total_active_stores}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Route Searches</CardTitle>
                  <Map className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staticData.total_route_searches}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Project View Analytics</span>

                    <div className="flex items-center gap-2">
                    <Select defaultValue={timeRange} onValueChange={(value) => handleSelectChange(value, "time")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a date range" />
                      </SelectTrigger>
                      <SelectContent defaultValue={timeRange} >
                        <SelectItem value="hour">1 Hour</SelectItem>
                        <SelectItem value="day">1 Day</SelectItem>
                        <SelectItem value="week">1 Week</SelectItem>
                        <SelectItem value="month">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  </CardTitle>
                </CardHeader>
                  <LinerChart  chartData={visitorChartData} timeRange={timeRange}/>
              </Card>
              <Card className="col-span-4">
                <CardHeader className="pb-2">
                  <CardTitle>Popular Stores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-scroll">
                    {popularStores.map((store, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{store?.name}</p>
                          <p className="text-sm text-muted-foreground">{store?.analytics_count} visits</p>
                        </div>
                        <Progress value={store?.analytics_count} max={store?.target} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Content</CardTitle>
                <CardDescription>This tab would contain detailed analytics for your mall maps.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Analytics content would be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="maps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Maps Content</CardTitle>
                <CardDescription>This tab would display all your created mall maps.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Your maps would be listed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings Content</CardTitle>
                <CardDescription>This tab would contain your account and application settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Settings options would be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
