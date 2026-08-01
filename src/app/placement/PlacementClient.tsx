'use client'

import React, { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '@/components/Modal'
import GlassCard from '@/components/GlassCard'
import { Plus, Building2, Calendar as CalIcon, DollarSign, Target, Trash2, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { addApplicationAction, updateApplicationStatusAction, deleteApplicationAction } from '@/app/actions/placement'

type Application = {
  id: string
  companyName: string
  role: string
  package: number
  deadline: Date
  status: string
  eligibility: string
}

const STAGES = [
  { id: 'APPLIED', label: 'Applied', color: 'bg-slate-400 dark:bg-slate-500', text: 'text-slate-600 dark:text-slate-300' },
  { id: 'OA_CLEARED', label: 'OA Cleared', color: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
  { id: 'INTERVIEW', label: 'Interview', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  { id: 'SELECTED', label: 'Selected', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'REJECTED', label: 'Rejected', color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
]

export default function PlacementClient({ initialApplications }: { initialApplications: Application[] }) {
  const [apps, setApps] = useState<Application[]>(initialApplications)
  const [showModal, setShowModal] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isAdding, startAddTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const stats = {
    total: apps.length,
    oaCleared: apps.filter(a => ['OA_CLEARED', 'INTERVIEW', 'SELECTED'].includes(a.status)).length,
    interviews: apps.filter(a => a.status === 'INTERVIEW').length,
    offers: apps.filter(a => a.status === 'SELECTED').length,
  }

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    startAddTransition(async () => {
      const result = await addApplicationAction(formData)
      if (result?.error) {
        setFormError(result.error)
      } else {
        setShowModal(false)
        window.location.reload()
      }
    })
  }

  const handleStatusChange = (appId: string, newStatus: string) => {
    setUpdatingId(appId)
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
    updateApplicationStatusAction(appId, newStatus).finally(() => setUpdatingId(null))
  }

  const handleDelete = (appId: string) => {
    setApps(prev => prev.filter(a => a.id !== appId))
    deleteApplicationAction(appId)
  }

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
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Placement Tracker</h1>
          <p className="text-muted-foreground mt-2 text-lg">Track all your applications across the recruitment pipeline.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} /> Add Application
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', value: stats.total, color: 'text-foreground' },
          { label: 'OAs Cleared', value: stats.oaCleared, color: 'text-indigo-500' },
          { label: 'Interviews', value: stats.interviews, color: 'text-amber-500' },
          { label: 'Offers', value: stats.offers, color: 'text-emerald-500' },
        ].map((s, i) => (
          <GlassCard key={s.label} className="p-5 text-center flex flex-col justify-center" noHover>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <h3 className={`text-4xl font-black mt-2 ${s.color}`}>{s.value}</h3>
          </GlassCard>
        ))}
      </motion.div>

      {/* Kanban Board */}
      <motion.div variants={container} className="flex gap-5 overflow-x-auto pb-6 snap-x custom-scrollbar">
        {STAGES.map(stage => {
          const stageApps = apps.filter(a => a.status === stage.id)
          return (
            <motion.div variants={item} key={stage.id} className="min-w-[320px] flex-1 snap-start">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold flex items-center gap-2 text-[15px]">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.color} shadow-sm`} />
                  {stage.label}
                </h3>
                <span className="bg-slate-100 dark:bg-zinc-800 text-foreground text-xs font-black px-2.5 py-1 rounded-md shadow-sm border border-slate-200/50 dark:border-white/5">
                  {stageApps.length}
                </span>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {stageApps.map(app => (
                    <motion.div key={app.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}>
                      <GlassCard className={`p-5 hover:border-primary/40 transition-all relative overflow-hidden group ${updatingId === app.id ? 'opacity-60 pointer-events-none' : ''}`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${stage.color}`} />

                        <div className="flex justify-between items-start mb-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center text-slate-500 shadow-inner border border-slate-200/50 dark:border-white/5">
                              <Building2 size={24} className="text-foreground" />
                            </div>
                            <div>
                              <h4 className="font-black text-lg leading-tight group-hover:text-primary transition-colors text-foreground">
                                {app.companyName}
                              </h4>
                              <p className="text-sm font-medium text-muted-foreground mt-0.5">{app.role}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Salary Badge & Deadline */}
                        <div className="flex items-center gap-3 pl-2 mb-4">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                            <DollarSign size={14} />
                            <span>{app.package} LPA</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800/80 text-muted-foreground text-xs font-bold border border-slate-200/50 dark:border-white/5">
                            <CalIcon size={14} /> {new Date(app.deadline).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Mini Timeline Tracker */}
                        <div className="pl-2 mb-5">
                          <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full -z-10" />
                            {STAGES.slice(0, 4).map((s, idx) => {
                              const currentStageIdx = STAGES.findIndex(st => st.id === app.status)
                              const isCompleted = idx <= currentStageIdx
                              const isCurrent = idx === currentStageIdx
                              
                              return (
                                <div key={s.id} className="relative group/tooltip flex justify-center">
                                  <div className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                                    isCurrent ? `${s.color} border-background scale-125 ring-2 ring-${s.color.split('-')[1]}-500/50` 
                                    : isCompleted ? `${s.color} border-${s.color.split('-')[1]}-500` 
                                    : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600'
                                  }`} />
                                  
                                  {/* Tooltip */}
                                  <div className="absolute -bottom-6 opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-bold bg-foreground text-background px-2 py-0.5 rounded pointer-events-none z-10">
                                    {s.label}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Inline status change */}
                        <div className="pl-2 relative">
                          <select
                            value={app.status}
                            onChange={e => handleStatusChange(app.id, e.target.value)}
                            className={`w-full text-xs font-bold bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/50 dark:border-white/5 rounded-lg py-2.5 px-3 focus:outline-none focus:border-primary/50 cursor-pointer appearance-none ${stage.text}`}
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {stageApps.length === 0 && (
                  <motion.div variants={item} className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center text-muted-foreground/50 text-center">
                    <Target size={24} className="mb-2 opacity-50" />
                    <p className="text-xs font-bold tracking-wider uppercase">Empty</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Add Application Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Application">
        <form onSubmit={handleAdd} className="space-y-5">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-500 text-sm font-medium">
              <AlertCircle size={16} /> {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold block mb-1">Company *</label>
              <input name="companyName" type="text" required placeholder="e.g., Google"
                className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium" />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">Role *</label>
              <input name="role" type="text" required placeholder="e.g., SDE Intern"
                className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold block mb-1">Package (LPA) *</label>
              <input name="package" type="number" step="0.1" required placeholder="e.g., 12.5"
                className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium" />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">Deadline *</label>
              <input name="deadline" type="date" required
                className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium" />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">Eligibility Criteria</label>
            <input name="eligibility" type="text" placeholder="e.g., CGPA ≥ 7.0, All branches"
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium" />
          </div>
          <button type="submit" disabled={isAdding}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/25">
            {isAdding ? <><Loader2 size={18} className="animate-spin" /> Adding...</> : <><Plus size={18} /> Add Application</>}
          </button>
        </form>
      </Modal>
    </motion.div>
  )
}
