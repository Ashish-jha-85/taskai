"use client"

import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { statusMeta } from "@/lib/task"
import type { TaskStatus } from "@/types/task"

export function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = statusMeta[status]
  const shouldPulse = status === "pending" || status === "running"

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.02em] shadow-sm",
        meta.className
      )}
    >
      <motion.span
        layout
        className={cn("size-1.5 rounded-full", meta.dotClassName)}
        animate={shouldPulse ? { scale: [1, 1.25, 1], opacity: [1, 0.65, 1] } : undefined}
        transition={shouldPulse ? { duration: 1.4, repeat: Number.POSITIVE_INFINITY } : undefined}
      />
      {meta.label}
    </Badge>
  )
}
