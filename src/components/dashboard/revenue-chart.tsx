
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const chartData = [
  { month: "يناير", revenue: 186, expenses: 80 },
  { month: "فبراير", revenue: 305, expenses: 200 },
  { month: "مارس", revenue: 237, expenses: 120 },
  { month: "أبريل", revenue: 273, expenses: 190 },
  { month: "مايو", revenue: 209, expenses: 130 },
  { month: "يونيو", revenue: 214, expenses: 140 },
]

const chartConfig = {
  revenue: {
    label: "الإيرادات",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "المصاريف",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>نظرة عامة على الإيرادات</CardTitle>
        <CardDescription>الإيرادات والمصاريف خلال آخر 6 أشهر</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
             <YAxis
                tickFormatter={(value) => `${value} ألف`}
                axisLine={false}
                tickLine={false}
                width={80}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
