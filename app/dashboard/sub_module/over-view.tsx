import React, { useEffect, useState } from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, ShoppingBag, Map } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import useQuery from '@/hooks/use-query'
import { Select, SelectContent, SelectValue, SelectItem, SelectTrigger } from "@/components/ui/select"
import { LinerChart } from '../line-chart'

type PopularStore = {
    name: string,
    analytics_count: number,
    target: number
}

type ChartData = {
    label: string
    data: number
}

const Overview = ({dateRange,timeRange,handleSelectChange} : {dateRange: string,timeRange:string,handleSelectChange: (value: string, type: "date" | "time") => void}) => {

    const [staticData, setStaticData] = useState({
        total_event: 0,
        total_visitor: 0,
        total_active_stores: 0,
        total_route_searches: 0
    })
    const [visitorChartData, setVisitorChartData] = useState<ChartData[]>([]);
    const [popularStores, setPopularStore] = useState<PopularStore[]>([]);

    const staticQuery = useQuery(`/dashboard/statistics?date_type=${dateRange}`);
    const popularStoreQuery = useQuery(`/dashboard/popular-stores?date_type=${dateRange}`);
    const chartDataQuery = useQuery(`/dashboard/visitor-tracks?date_type=${timeRange}`);


    useEffect(() => {
        if (chartDataQuery?.data) {
            setVisitorChartData(chartDataQuery.data.data as ChartData[]);
        }
    }, [chartDataQuery?.isFetching])

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
                    <LinerChart chartData={visitorChartData} timeRange={timeRange} />
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
    )
}

export default Overview