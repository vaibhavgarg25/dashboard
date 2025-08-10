"use client"

import { CalendarDays, Home, LineChart, LogOut, Settings, User2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "./auth-context"

type Item = { title: string; url: string; icon: any }

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, user } = useAuth()
  const role = user?.role

  const items: Item[] = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    ...(role === "ADMIN" ? [{ title: "Analytics", url: "/dashboard#analytics", icon: LineChart }] : []),
    ...(role !== "STUDENT" ? [{ title: "Calendar", url: "/dashboard#calendar", icon: CalendarDays }] : []),
    { title: "Profile", url: "/profile", icon: User2 },
    ...(role === "ADMIN" ? [{ title: "Settings", url: "/dashboard#settings", icon: Settings }] : []),
  ]

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <div className="text-sm font-semibold">Edu Admin</div>
          <div className="text-xs text-muted-foreground capitalize">{role?.toLowerCase() || "user"}</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                signOut()
                router.push("/login")
              }}
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
            <SidebarMenuAction title="Sign out">
              <LogOut />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
