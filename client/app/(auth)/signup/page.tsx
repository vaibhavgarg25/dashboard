"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-context"
import type { Role } from "@/lib/graphql-client"
import { toast } from "sonner"

export default function Page() {
  const router = useRouter()
  const { signUp } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("TEACHER")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await signUp({ name, email, password, role })

      toast.success("Account created successfully", {
        description: `Welcome aboard, ${name || email}`,
      })

      router.push("/dashboard")
    } catch (err: any) {
      toast.error("Sign up failed", {
        description: err?.message || "Something went wrong while creating your account",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100svh] grid place-items-center bg-gradient-to-b from-background to-muted">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-4"
      >
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>It only takes a minute</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Alex Johnson"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={loading} type="submit" className="w-full">
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-4">
              Have an account?{" "}
              <Link className="underline underline-offset-4" href="/login">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
