"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  Bot,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelsTopLeft,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth.store"

const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: PanelsTopLeft,
  },
]

function getPageMeta(pathname: string) {
  if (pathname.startsWith("/tasks/")) {
    return {
      title: "Task Details",
      description: "Track execution, inspect logs, and review output.",
    }
  }

  if (pathname.startsWith("/tasks")) {
    return {
      title: "Task Pipeline",
      description: "Search, filter, retry, and monitor every submitted task.",
    }
  }

  return {
    title: "Dashboard",
    description: "Operational visibility across queue health, throughput, and recent work.",
  }
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      <div className="flex h-18 items-center gap-3 border-b border-zinc-200 px-6 dark:border-zinc-800">
        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
          <Bot className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">TaskAI</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Task Processing Platform</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                )}
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, token, hydrated, logout } = useAuthStore()

  const pageMeta = useMemo(() => getPageMeta(pathname), [pathname])

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login")
    }
  }, [hydrated, router, token])

  const handleLogout = () => {
    logout()
    toast.success("You have been signed out.")
    router.replace("/login")
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          Preparing your workspace...
        </div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-white/95 backdrop-blur md:flex dark:border-zinc-800 dark:bg-zinc-900/95">
          <SidebarContent pathname={pathname} />
        </aside>

        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogContent
            className="left-0 top-0 h-dvh w-[84vw] max-w-[20rem] translate-x-0 translate-y-0 rounded-none border-r border-zinc-200 p-0 dark:border-zinc-800"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">Navigation</DialogTitle>
            <SidebarContent pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
          </DialogContent>
        </Dialog>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
            <div className="flex h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="size-4" />
                </Button>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold tracking-tight">{pageMeta.title}</p>
                  <p className="hidden text-sm text-zinc-600 md:block dark:text-zinc-400">
                    {pageMeta.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" className="rounded-xl" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        className="h-10 gap-3 rounded-xl px-3"
                      />
                    }
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="max-w-32 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {user?.name ?? "Workspace"}
                      </p>
                      <p className="max-w-32 truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                    <DropdownMenuItem render={<Link href="/dashboard" />}>
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/tasks" />}>
                      <PanelsTopLeft className="size-4" />
                      Tasks
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} variant="destructive">
                      <LogOut className="size-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
