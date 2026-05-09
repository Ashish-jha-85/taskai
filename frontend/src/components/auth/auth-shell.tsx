"use client"

import { Bot } from "lucide-react"
import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"

export function AuthShell({
  title,
  description,
  footer,
  children,
}: {
  title: string
  description: string
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Bot className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">TaskAI</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Task Processing Platform</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            </div>

            {children}

            <div className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
