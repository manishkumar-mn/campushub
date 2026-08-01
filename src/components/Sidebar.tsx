'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Briefcase, 
  HelpCircle, 
  Search, 
  Calendar, 
  Library, 
  User, 
  Settings,
  Sparkles,
  Shield
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Notes', href: '/notes', icon: BookOpen },
  { name: 'Resources', href: '/resources', icon: Library },
  { name: 'Placements', href: '/placement', icon: Briefcase },
  { name: 'Study Groups', href: '/groups', icon: Users },
  { name: 'Doubt Board', href: '/doubt-board', icon: HelpCircle },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'AI Help', href: '/ai', icon: Sparkles },
  { name: 'Lost & Found', href: '/lost-found', icon: Search },
]

export default function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname()

  return (
    <aside className="glass-panel w-64 h-screen fixed left-0 top-0 flex flex-col pt-6 pb-4 px-4 z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/5">
      <div className="flex items-center gap-3 mb-10 px-2 pl-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
          C
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          CampusHub
        </span>
      </div>

      <nav className="flex-1 space-y-1 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group ${
                isActive 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl -z-10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-slate-100/0 dark:bg-slate-800/0 group-hover:bg-slate-100/50 dark:group-hover:bg-zinc-800/50 rounded-xl -z-10 transition-colors duration-200" />
              )}
              <Icon size={18} className={isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-1 pt-6 border-t border-slate-200/50 dark:border-white/10">
        {role === 'ADMIN' && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold transition-colors"
          >
            <Shield size={18} />
            Admin Panel
          </Link>
        )}
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 hover:text-foreground transition-colors"
        >
          <User size={18} />
          Profile
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 hover:text-foreground transition-colors"
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  )
}
