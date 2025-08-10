"use client"

import type React from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/components/auth-context"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      const inAuth = pathname?.startsWith("/login") || pathname?.startsWith("/signup")
      if (!user && !inAuth) {
        router.replace("/login")
      }
    }
  }, [user, loading, router, pathname])

  if (!user && !loading) {
    return null
  }
  return <>{children}</>
}

// AuthProvider is applied globally via app/template.tsx.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Protected>{children}</Protected>
      </SidebarInset>
    </SidebarProvider>
  )
}
