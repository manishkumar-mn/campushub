'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { 
  BookOpen, 
  Users, 
  Briefcase, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Clock,
  Flame,
  Target
} from 'lucide-react'

type DashboardProps = {
  user: { name: string | null }
  stats: {
    notes: number
    groups: number
    events: number
    apps: number
  }
}

// CountUp Component
const CountUp = ({ end, duration = 2 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number | null = null
    const animate = (time: number) => {
      if (!startTime) startTime = time
      const progress = Math.min((time - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return <span>{count}</span>
}

export default function DashboardClient({ user, stats }: DashboardProps) {
  const [greeting, setGreeting] = useState('Welcome back')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8 pb-10">
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">{user.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Here's what is happening across CampusHub today.
          </p>
        </div>
        <div className="flex gap-3">
          <GlassCard className="px-4 py-2 flex items-center gap-2 !rounded-xl">
            <Flame className="text-orange-500" size={18} />
            <span className="font-bold">12 Day Streak</span>
          </GlassCard>
          <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary/25 active:scale-95">
            New Workspace
          </button>
        </div>
      </motion.div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-4 cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Notes</p>
              <h3 className="text-3xl font-bold mt-1 text-foreground"><CountUp end={stats.notes} /></h3>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-4 cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Groups</p>
              <h3 className="text-3xl font-bold mt-1 text-foreground"><CountUp end={stats.groups} /></h3>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-4 cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Briefcase size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">My Applications</p>
              <h3 className="text-3xl font-bold mt-1 text-foreground"><CountUp end={stats.apps} /></h3>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-4 cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
              <h3 className="text-3xl font-bold mt-1 text-foreground"><CountUp end={stats.events} /></h3>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Activity Feed</h2>
            <button className="text-sm text-primary font-medium hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          <GlassCard className="space-y-6 relative overflow-hidden" noHover>
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {[
              { icon: Briefcase, color: 'emerald', text: 'Google has posted a new Software Engineer internship.', time: '2h ago', context: 'Placement Cell' },
              { icon: BookOpen, color: 'purple', text: 'Dr. Brown uploaded "Advanced Thermodynamics PYQs".', time: '4h ago', context: 'Mechanical' },
              { icon: Users, color: 'indigo', text: 'Alice invited you to join "React Developers".', time: '5h ago', action: true }
            ].map((feed, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="w-full h-px bg-slate-200/50 dark:bg-white/5"></div>}
                <div className="flex gap-4 group">
                  <div className={`w-10 h-10 rounded-full bg-${feed.color}-500/10 text-${feed.color}-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <feed.icon size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{feed.text}</p>
                    {feed.action ? (
                      <div className="flex items-center gap-2 mt-3">
                        <button className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90 active:scale-95 transition-all">Accept</button>
                        <button className="text-xs bg-slate-100 dark:bg-zinc-800 text-foreground px-4 py-1.5 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 transition-all">Decline</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Clock size={12} /> {feed.time}</span>
                        <span>•</span>
                        <span>{feed.context}</span>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </GlassCard>
        </motion.div>

        {/* Sidebar Feed */}
        <motion.div variants={item} className="space-y-6">
          <h2 className="text-xl font-bold">Placement Progress</h2>
          <GlassCard className="flex flex-col items-center justify-center text-center p-8" noHover>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="12" fill="none" />
                <circle cx="64" cy="64" r="56" className="stroke-primary" strokeWidth="12" fill="none" strokeDasharray="351.8" strokeDashoffset="87.9" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">75%</span>
              </div>
            </div>
            <h3 className="font-bold mt-6 text-lg">Profile Strength</h3>
            <p className="text-sm text-muted-foreground mt-2 px-4">
              Upload your latest resume and complete your skills section to reach 100%.
            </p>
            <button className="mt-6 w-full py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors">
              Update Profile
            </button>
          </GlassCard>

          <h2 className="text-xl font-bold pt-4">Trending Topics</h2>
          <GlassCard className="p-0 overflow-hidden" noHover>
            {[
              { q: 'How to implement a Red-Black Tree?', stats: '15 answers • 120 views', trend: true },
              { q: 'Best resources for OS prep?', stats: '8 answers • 85 views' },
              { q: 'TCS NQT Registration ending soon', stats: 'Placement Cell • 45 comments' }
            ].map((t, i) => (
              <div key={i} className="p-5 border-b last:border-b-0 border-slate-200/50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                {t.trend && (
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-primary font-bold mb-1.5">
                    <TrendingUp size={14} /> Trending
                  </div>
                )}
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{t.q}</p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">{t.stats}</p>
              </div>
            ))}
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  )
}
