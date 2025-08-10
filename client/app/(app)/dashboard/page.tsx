"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { TopNav } from "@/components/top-nav"
import { DateRangeFilter, type DateRangeValue } from "@/components/date-range-filter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { motion } from "framer-motion"
import debounce from "lodash.debounce"
import { fetchDashboard, type DashboardData, type DashboardFilters, type Role } from "@/lib/graphql-client"
import { useAuth } from "@/components/auth-context"
import { Users, TrendingUp, Activity } from "lucide-react"

export default function Page() {
  const { token, user } = useAuth()
  const viewerRole = user?.role || "STUDENT"

  const [search, setSearch] = useState("")
  const [role, setRole] = useState<Role | "ALL">("") // Only used by Admin
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: new Date(new Date().setDate(new Date().getDate() - 6)),
    to: new Date(),
  })
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)

  const filters: DashboardFilters = useMemo(
    () => ({
      q: search || undefined,
      role:
        viewerRole === "ADMIN"
          ? role !== "ALL"
            ? role
            : undefined
          : undefined, // Only admin can role-filter
      startDate: dateRange?.from ? dateRange.from.toISOString().slice(0, 10) : undefined,
      endDate: dateRange?.to ? dateRange.to.toISOString().slice(0, 10) : undefined,
    }),
    [search, role, dateRange, viewerRole],
  )

  const load = useMemo(
    () =>
      debounce(async (f: DashboardFilters) => {
        setLoading(true)
        try {
          const res = await fetchDashboard({ token: token ?? undefined, filters: f })
          setData({
            ...res,
            users: res.users.map(u => ({
              ...u,
              role: u.role as Role
            }))
          })
        } finally {
          setLoading(false)
        }
      }, 250),
    [token],
  )

  useEffect(() => {
    load(filters)
    return () => {
      load.cancel()
    }
  }, [filters, load])

  // RBAC transforms — filter at display time
  const students = useMemo(() => (data?.users || []).filter((u) => u.role === "STUDENT"), [data])
  const teachers = useMemo(() => (data?.users || []).filter((u) => u.role === "TEACHER"), [data])

  const trendForStudents = useMemo(() => {
    return (data?.trend || []).map((d) => ({
      date: d.date,
      signups: students.filter((u) => u.createdAt.slice(0, 10) === d.date).length,
    }))
  }, [data, students])

  // Metrics — all from backend
  const teacherMetrics = useMemo(() => {
    const last7 = new Date(Date.now() - 7 * 24 * 3600 * 1000)
    return {
      totalStudents: students.length,
      weeklyStudentSignups: students.filter((s) => new Date(s.createdAt) >= last7).length,
      activeStudents: data?.summary.activeThisWeek ?? 0,
    }
  }, [students, data])

  const studentMetrics = useMemo(() => {
    const last7 = new Date(Date.now() - 7 * 24 * 3600 * 1000)
    return {
      totalPeers: students.length,
      weeklyPeerSignups: students.filter((s) => new Date(s.createdAt) >= last7).length,
      activePeers: data?.summary.activeThisWeek ?? 0,
    }
  }, [students, data])

  return (
    <div className="flex flex-col min-h-[100svh]">
      <TopNav search={search} setSearch={setSearch} />
      <main className="p-4 md:p-6 space-y-6">
        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {viewerRole === "ADMIN"
                ? "Admin Dashboard"
                : viewerRole === "TEACHER"
                  ? "Teacher Dashboard"
                  : "Student Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {viewerRole === "ADMIN"
                ? "Organization-wide overview"
                : viewerRole === "TEACHER"
                  ? "Student-focused insights"
                  : "Peers activity overview"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            {viewerRole === "ADMIN" ? (
              <Select value={role} onValueChange={(v) => setRole(v as Role | "ALL")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
          </div>
        </section>

        {/* Metrics */}
        {viewerRole === "ADMIN" ? (
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Teachers"
                value={data?.summary.totalTeachers ?? 0}
                icon={<Users className="h-5 w-5 text-emerald-600" />}
              />
              <MetricCard
                title="Students"
                value={data?.summary.totalStudents ?? 0}
                icon={<Users className="h-5 w-5 text-rose-600" />}
              />
              <MetricCard
                title="Weekly signups"
                value={data?.summary.weeklySignups ?? 0}
                icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
              />
              <MetricCard
                title="Active this week"
                value={data?.summary.activeThisWeek ?? 0}
                icon={<Activity className="h-5 w-5 text-violet-600" />}
              />
            </div>
          </section>
        ) : viewerRole === "TEACHER" ? (
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Students"
                value={teacherMetrics.totalStudents}
                icon={<Users className="h-5 w-5 text-rose-600" />}
              />
              <MetricCard
                title="Weekly student signups"
                value={teacherMetrics.weeklyStudentSignups}
                icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
              />
              <MetricCard
                title="Active students"
                value={teacherMetrics.activeStudents}
                icon={<Activity className="h-5 w-5 text-violet-600" />}
              />
            </div>
          </section>
        ) : (
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Peers"
                value={studentMetrics.totalPeers}
                icon={<Users className="h-5 w-5 text-blue-600" />}
              />
              <MetricCard
                title="Weekly peer signups"
                value={studentMetrics.weeklyPeerSignups}
                icon={<TrendingUp className="h-5 w-5 text-green-600" />}
              />
              <MetricCard
                title="Active peers"
                value={studentMetrics.activePeers}
                icon={<Activity className="h-5 w-5 text-purple-600" />}
              />
            </div>
          </section>
        )}

        {/* Chart */}
        <section id="analytics" className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">
                {viewerRole === "ADMIN"
                  ? "Signups trend"
                  : viewerRole === "TEACHER"
                    ? "Student signups trend"
                    : "Peers signups trend"}
              </CardTitle>
              <span className="text-xs text-muted-foreground">{loading ? "Updating..." : "Live"}</span>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ChartContainer
                config={{
                  signups: { label: "Signups", color: "hsl(var(--chart-1))" },
                }}
                className="h-full w-full overflow-hidden"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    data={
                      viewerRole === "ADMIN"
                        ? (data?.trend || [])
                        : viewerRole === "TEACHER"
                          ? trendForStudents
                          : trendForStudents
                    }
                  >
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-signups)" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="var(--color-signups)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis hide />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="signups"
                      stroke="var(--color-signups)"
                      fill="url(#colorUv)"
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {viewerRole === "ADMIN" ? (
                <p>
                  Role filter: <span className="font-medium">{role}</span>
                </p>
              ) : (
                <p>
                  Role: <span className="font-medium">{viewerRole}</span>
                </p>
              )}
              <p>
                Range:{" "}
                <span className="font-medium">
                  {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
                </span>
              </p>
              <p>
                Keyword: <span className="font-medium">{search || "—"}</span>
              </p>
              <p className="text-muted-foreground">
                {viewerRole === "ADMIN"
                  ? "Org-level data"
                  : viewerRole === "TEACHER"
                    ? "Student-only data"
                    : "Peers data"}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Users table for all roles */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {viewerRole === "ADMIN" ? "Users" : viewerRole === "TEACHER" ? "Students" : "Peers"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {loading
                ? "Loading..."
                : viewerRole === "ADMIN"
                  ? `${data?.users.length ?? 0} results`
                  : `${students.length} results`}
            </span>
          </div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">Name</TableHead>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.users || [])
                      .filter((u) => {
                        const effectiveRole = role === "" ? viewerRole : role;

                        if (effectiveRole === "ALL") return true;

                        // ADMIN sees everyone
                        if (effectiveRole === "ADMIN") return true;

                        // TEACHER sees only teachers
                        if (effectiveRole === "TEACHER") return u.role === "STUDENT";

                        // STUDENT sees only students
                        if (effectiveRole === "STUDENT") return u.role === "STUDENT";

                        return false;
                      })
                      .map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <span className="rounded-full px-2 py-0.5 text-xs border">
                              {u.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Date(Number(u.createdAt)).toLocaleDateString("en-GB")}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>
    </div>
  )
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end justify-between">
          <div className="text-3xl font-semibold">{value}</div>
          {icon}
        </CardContent>
      </Card>
    </motion.div>
  )
}
