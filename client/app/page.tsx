"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login")
    }
  }, [user, loading, router])

  return <div className="grid place-items-center h-[100svh] text-sm text-muted-foreground">Redirecting...</div>
}
