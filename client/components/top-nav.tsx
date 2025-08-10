"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "./auth-context"

export function TopNav({
  search,
  setSearch,
  onOpenFilters,
}: {
  search: string
  setSearch: (v: string) => void
  onOpenFilters?: () => void
}) {
  const { user } = useAuth()

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
    >
      <div className="flex items-center gap-3 px-4 py-2">
        <SidebarTrigger />
        <div className="relative flex-1 max-w-xl">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users, emails..."
            className="pl-3 pr-10"
            aria-label="Global search"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-9 w-9 text-muted-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">{"Notifications"}</span>
          </Button>
        </div>
        {onOpenFilters ? (
          <Button variant="outline" onClick={onOpenFilters} className="hidden sm:inline-flex bg-transparent">
            Filters
          </Button>
        ) : null}
        <Button variant="ghost" className="gap-2 pl-1 pr-2">
          <Avatar className="h-7 w-7">
            <AvatarImage
              src={user?.avatarUrl || "/placeholder.svg?height=64&width=64&query=profile%20avatar"}
              alt="User avatar"
            />
            <AvatarFallback>{(user?.name || "U").slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm">{user?.name || "User"}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </motion.header>
  )
}
