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
import { useAuth } from "@/components/auth-context"
import { toast } from "sonner"

export default function Page() {
  const router = useRouter()
  const { signIn } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)

      toast.success("Signed in successfully", {
        description: `Welcome back, ${email}`,
      })

      router.push("/dashboard")
    } catch (err: any) {
      toast.error("Sign in failed", {
        description: err?.message || "Invalid email or password",
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
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
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
              <Button disabled={loading} type="submit" className="w-full">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-4">
              No account?{" "}
              <Link className="underline underline-offset-4" href="/signup">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
