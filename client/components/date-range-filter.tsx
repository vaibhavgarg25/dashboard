"use client"

import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"

export type DateRangeValue = { from?: Date; to?: Date }

export function DateRangeFilter({
  value,
  onChange,
  className,
}: {
  value: DateRangeValue
  onChange: (v: DateRangeValue) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)

  const presets = [
    { label: "Last 7 days", range: { from: addDays(new Date(), -6), to: new Date() } },
    { label: "Last 30 days", range: { from: addDays(new Date(), -29), to: new Date() } },
    {
      label: "This month",
      range: { from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() },
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex items-center gap-2", className)}
    >
      {presets.map((p) => (
        <Button
          key={p.label}
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onChange(p.range)}
          className="rounded-full"
        >
          {p.label}
        </Button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !value?.from && !value?.to && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} - {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>{"Pick a date range"}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value as any}
            onSelect={(r: any) => onChange(r)}
            numberOfMonths={2}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </motion.div>
  )
}
