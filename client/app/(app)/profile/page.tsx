"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProfileRequest, getCurrentUserRequest } from "@/lib/graphql-client"

export default function Page() {
  const { user: authUser, token, setUser } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  // Fetch fresh user details on load
  useEffect(() => {
    if (!token) return
    getCurrentUserRequest({ token }).then((freshUser) => {
      setUser(freshUser)
      setName(freshUser.name || "")
      setEmail(freshUser.email || "")
      setBio(freshUser.bio || "")
      setAvatarPreview(freshUser.avatarUrl)
    })
  }, [token, setUser])

  const isGmail = (value: string) => /^[\w.+-]+@gmail\.com$/i.test(value)
  const canSave = useMemo(() => {
    return name.trim() && email.trim() && isValidEmail(email)
  }, [name, email])


  async function onSave() {
    setError("")
    if (!isGmail(email)) {
      setError("Email must be a valid @gmail.com address")
      return
    }

    setSaving(true)
    setSaved(false)
    try {
      const updatedUser = await updateProfileRequest({
        token: token ?? undefined,
        input: { name, email, bio, avatarUrl: avatarPreview },
      })
      setUser(updatedUser)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } finally {
      setSaving(false)
    }
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">View and update your information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Avatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border">
                <Image
                  src={avatarPreview || "/placeholder.svg?height=80&width=80&query=profile%20avatar"}
                  alt="Avatar preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <Label htmlFor="avatar" className="sr-only">
                  Upload avatar
                </Label>
                <Input id="avatar" type="file" accept="image/*" onChange={onAvatarChange} />
                <p className="text-xs text-muted-foreground mt-1">Recommended: square image</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about you"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex items-center gap-2">
                <Button disabled={!canSave || saving} onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700">
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                {saved ? (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-600 text-sm"
                  >
                    Saved!
                  </motion.span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
