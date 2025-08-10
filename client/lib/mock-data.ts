export type Role = "ADMIN" | "TEACHER" | "STUDENT"

const roles: Role[] = ["ADMIN", "TEACHER", "STUDENT"]

function dateNDaysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
function fmt(d: Date) {
  return d.toISOString().slice(0, 10)
}

const firstNames = ["Alex", "Taylor", "Jordan", "Casey", "Riley", "Morgan", "Cameron", "Avery", "Peyton", "Rowan"]
const lastNames = ["Nguyen", "Lee", "Patel", "Garcia", "Smith", "Kim", "Brown", "Walker", "Hughes", "Clark"]

export function generateMockDashboard(filters?: {
  startDate?: string
  endDate?: string
  role?: Role | "ALL"
  q?: string
}) {
  const today = new Date()
  const end = filters?.endDate ? new Date(filters.endDate) : today
  const start = filters?.startDate ? new Date(filters.startDate) : dateNDaysAgo(29)

  // Seed users across the last 120 days
  const users = Array.from({ length: 140 }).map((_, i) => {
    const createdAt = dateNDaysAgo(Math.floor(Math.random() * 120))
    const role = Math.random() < 0.2 ? "ADMIN" : Math.random() < 0.6 ? "STUDENT" : "TEACHER"
    const idx = Math.floor(Math.random() * firstNames.length)
    const name = `${firstNames[idx]} ${lastNames[idx % lastNames.length]}`
    const email = `${name.toLowerCase().replace(/\s/g, ".")}${i}@example.com`
    return {
      id: `u_${i + 1}`,
      name,
      email,
      role,
      createdAt: createdAt.toISOString(),
    }
  })

  // Apply filters
  const filtered = users.filter((u) => {
    const d = new Date(u.createdAt)
    const inRange = d >= start && d <= end
    const roleOk = !filters?.role || filters.role === "ALL" ? true : u.role === filters.role
    const q = (filters?.q || "").toLowerCase()
    const qOk = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return inRange && roleOk && qOk
  })

  // Trend by day
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const trend: { date: string; signups: number }[] = []
  for (let i = 0; i < days; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const count = filtered.filter((u) => fmt(new Date(u.createdAt)) === fmt(date)).length
    trend.push({ date: fmt(date), signups: count })
  }

  return {
    summary: {
      totalTeachers: filtered.filter((u) => u.role === "TEACHER").length,
      totalStudents: filtered.filter((u) => u.role === "STUDENT").length,
      weeklySignups: filtered.filter((u) => new Date(u.createdAt) >= dateNDaysAgo(7)).length,
      activeThisWeek: Math.floor(filtered.length * 0.4),
    },
    trend,
    users: filtered,
  }
}
