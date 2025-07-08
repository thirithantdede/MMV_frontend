"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart with a custom label"

const chartConfig = {
  data: {
    label: "data",
    color: "var(--chart-3)",
  },
 
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig

export function AnalysisBar({chartData} : {chartData : any}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assets & Conversion</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 10,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="label"
              type="category"   
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="data" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
                barSize={40}
              dataKey="data"
              layout="vertical"
              fill="var(--color-data)"
              radius={4}
            >
              <LabelList
                dataKey="label"
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
              />
              <LabelList
                dataKey="data"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
