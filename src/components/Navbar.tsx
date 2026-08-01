'use client'

import { Search, Bell, LogOut, Sun, Moon } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { useTransition, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
      title="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </motion.button>
  )
}

type NavbarProps = {
  user: {
    name: string
    email: string
    image: string | null
    role: string
    branch: string | null | undefined
  }
}

export default function Navbar({ user }: NavbarProps) {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-16 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 z-30 flex items-center justify-between px-6 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden md:block group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search notes, groups, events..."
            className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </motion.button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200/50 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="text-[11px] text-muted-foreground mt-1 tracking-wide">
              {user.role} {user.branch ? `• ${user.branch}` : ''}
            </p>
          </div>
          <div className="relative group cursor-pointer">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-slate-200/50 dark:border-white/10 shadow-sm object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            disabled={isPending}
            title="Sign out"
            className="p-2 ml-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>
    </header>
  )
}
