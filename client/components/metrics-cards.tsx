"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Users, UserCheck, TrendingUp, Activity } from "lucide-react"

export function MetricsCards({
  metrics = { totalTeachers: 0, totalStudents: 0, weeklySignups: 0, activeThisWeek: 0 },
}: {
  metrics?: { totalTeachers: number; totalStudents: number; weeklySignups: number; activeThisWeek: number }
}) {
  const items = [
    { label: "Teachers", value: metrics.totalTeachers, icon: UserCheck, color: "text-emerald-600" },
    { label: "Students", value: metrics.totalStudents, icon: Users, color: "text-rose-600" },
    { label: "Weekly signups", value: metrics.weeklySignups, icon: TrendingUp, color: "text-amber-600" },
    { label: "Active this week", value: metrics.activeThisWeek, icon: Activity, color: "text-violet-600" },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div className="text-3xl font-semibold">{item.value}</div>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
