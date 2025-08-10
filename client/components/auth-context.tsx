"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { loginRequest, signupRequest, type Role, type User } from "@/lib/graphql-client"

type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: { name: string; email: string; password: string; role: Role }) => Promise<void>
  signOut: () => void
  setUser:any
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem("auth:token")
    const u = localStorage.getItem("auth:user")
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
    setLoading(false)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user } = await loginRequest({ email, password })
    setToken(token)
    setUser(user)
    localStorage.setItem("auth:token", token)
    localStorage.setItem("auth:user", JSON.stringify(user))
  }, [])

  const signUp = useCallback(async (input: { name: string; email: string; password: string; role: Role }) => {
    const { token, user } = await signupRequest(input)
    setToken(token)
    setUser(user)
    localStorage.setItem("auth:token", token)
    localStorage.setItem("auth:user", JSON.stringify(user))
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem("auth:token")
    localStorage.removeItem("auth:user")
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, signIn, signUp, signOut ,setUser}),
    [user, token, loading, signIn, signUp, signOut , setUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
