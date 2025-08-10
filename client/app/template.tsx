"use client"

import type React from "react"
import { AuthProvider } from "@/components/auth-context"

// Wrap ALL routes in AuthProvider to fix the context error and keep auth available globally [^1].
export default function Template({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
