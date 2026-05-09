"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types/task"

const steps = ["pending", "running", "success"] as const

function getStepState(step: (typeof steps)[number], status: TaskStatus) {
  if (status === "failed") {
    if (step === "success") {
      return "failed"
    }

    return step === "pending" || step === "running" ? "complete" : "upcoming"
  }

  const currentIndex = steps.indexOf(status === "success" ? "success" : status)
  const stepIndex = steps.indexOf(step)

  if (stepIndex < currentIndex) {
    return "complete"
  }

  if (stepIndex === currentIndex) {
    return "current"
  }

  return "upcoming"
}

export function StatusTimeline({ status }: { status: TaskStatus }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {steps.map((step, index) => {
        const state = getStepState(step, status)
        const label = step === "pending" ? "Queued" : step === "running" ? "Processing" : "Completed"

        return (
          <div key={step} className="flex items-center gap-3">
            <div className="relative flex items-center">
              <motion.div
                layout
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-xs font-semibold",
                  state === "complete" &&
                    "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300",
                  state === "current" &&
                    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300",
                  state === "failed" &&
                    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
                  state === "upcoming" &&
                    "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
                )}
                animate={
                  state === "current"
                    ? { boxShadow: ["0 0 0 0 rgba(37,99,235,0.22)", "0 0 0 8px rgba(37,99,235,0)"] }
                    : undefined
                }
                transition={
                  state === "current"
                    ? { duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }
                    : undefined
                }
              >
                {index + 1}
              </motion.div>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {state === "complete" && "Finished"}
                {state === "current" && "In progress"}
                {state === "upcoming" && "Waiting"}
                {state === "failed" && "Stopped"}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
