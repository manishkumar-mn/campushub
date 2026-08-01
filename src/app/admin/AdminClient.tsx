'use client'

import React, { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import {
  Shield, Users, BookOpen, Library, UsersRound, HelpCircle,
  Calendar, Trash2, ChevronDown, Loader2, CheckCircle2,
  AlertTriangle, Activity, Database, TrendingUp, Crown,
  GraduationCap, UserCheck, Search, RefreshCw
} from 'lucide-react'
import {
  changeUserRoleAction, deleteUserAction, deleteNoteAction,
  deleteResourceAction, deleteGroupAction, deleteQuestionAction
} from '@/app/actions/admin'

type Stats = {
  totalUsers: number; totalNotes: number; totalResources: number
  totalGroups: number; totalQuestions: number; totalEvents: number
  adminCount: number; facultyCount: number
}

type AdminUser = {
  id: string; name: string; email: string; role: string
  branch: string | null; createdAt: string; image: string | null
  notesCount: number; resourcesCount: number; groupsCount: number
}

type AdminNote = {
  id: string; title: string; subject: string; branch: string
  semester: number; uploaderName: string; createdAt: string; downloads: number
}

type AdminResource = {
  id: string; title: string; category: string; type: string
  uploaderName: string; createdAt: string; downloads: number
}

type AdminGroup = {
  id: string; name: string; description: string
  memberCount: number; createdAt: string
}

type AdminQuestion = {
  id: string; title: string; authorName: string
  answerCount: number; solved: boolean; createdAt: string
}

type AdminEvent = {
  id: string; title: string; date: string; registrations: number
}

type Props = {
  adminName: string; stats: Stats
  users: AdminUser[]; notes: AdminNote[]; resources: AdminResource[]
  groups: AdminGroup[]; questions: AdminQuestion[]; events: AdminEvent[]
}

const TABS = ['Overview', 'Users', 'Notes', 'Resources', 'Groups', 'Doubt Board', 'Events']

const ROLES = ['STUDENT', 'FACULTY', 'ADMIN']

const roleColors: Record<string, string> = {
  ADMIN: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  FACULTY: 'bg-primary/10 text-primary border-primary/20',
  STUDENT: 'bg-slate-100 dark:bg-zinc-800 text-muted-foreground border-transparent',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <GlassCard className={`p-4 flex items-center gap-4 border-l-4 ${color}`} noHover>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.replace('border-l-', 'bg-').replace('500', '500/10').replace('border-', '')}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black leading-none mt-0.5">{value}</h3>
      </div>
    </GlassCard>
  )
}

export default function AdminClient({ adminName, stats, users, notes, resources, groups, questions, events }: Props) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string; name: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = (type: string, id: string, name: string) => {
    setConfirmDelete({ type, id, name })
  }

  const confirmAction = () => {
    if (!confirmDelete) return
    startTransition(async () => {
      const { type, id } = confirmDelete
      if (type === 'user') await deleteUserAction(id)
      else if (type === 'note') await deleteNoteAction(id)
      else if (type === 'resource') await deleteResourceAction(id)
      else if (type === 'group') await deleteGroupAction(id)
      else if (type === 'question') await deleteQuestionAction(id)
      setConfirmDelete(null)
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`)
    })
  }

  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      await changeUserRoleAction(userId, newRole)
      showToast(`Role updated to ${newRole}`)
    })
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  )

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-xl font-bold text-sm"
          >
            <CheckCircle2 size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-rose-500" />
              </div>
              <h3 className="text-lg font-black text-center text-foreground">Confirm Delete</h3>
              <p className="text-center text-sm text-muted-foreground mt-2 font-medium">
                Are you sure you want to delete<br />
                <span className="font-black text-foreground">"{confirmDelete.name}"</span>?<br />
                This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-border rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
                  Cancel
                </button>
                <button onClick={confirmAction} disabled={isPending} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Shield size={20} className="text-white" />
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-500">Admin Control Panel</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium ml-13">
            Welcome, <span className="font-black text-foreground">{adminName}</span> — you have full platform access
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 font-bold text-sm">
          <Crown size={16} /> Super Admin
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100/50 dark:bg-zinc-900/50 p-1 rounded-2xl overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch('') }}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-zinc-800 text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search (for data tabs) */}
      {activeTab !== 'Overview' && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-primary/40 transition-all"
          />
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="border-l-indigo-500" />
            <StatCard label="Total Notes" value={stats.totalNotes} icon={BookOpen} color="border-l-emerald-500" />
            <StatCard label="Resources" value={stats.totalResources} icon={Library} color="border-l-amber-500" />
            <StatCard label="Study Groups" value={stats.totalGroups} icon={UsersRound} color="border-l-purple-500" />
            <StatCard label="Doubt Posts" value={stats.totalQuestions} icon={HelpCircle} color="border-l-rose-500" />
            <StatCard label="Events" value={stats.totalEvents} icon={Calendar} color="border-l-cyan-500" />
            <StatCard label="Admins" value={stats.adminCount} icon={Shield} color="border-l-rose-500" />
            <StatCard label="Faculty" value={stats.facultyCount} icon={GraduationCap} color="border-l-blue-500" />
          </div>

          {/* Recent Users */}
          <GlassCard className="p-6" noHover>
            <h2 className="font-black text-lg mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Recent Registrations</h2>
            <div className="space-y-3">
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{u.name}</p>
                      <p className="text-[11px] text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${roleColors[u.role]}`}>{u.role}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'Users' && (
        <GlassCard className="p-0 overflow-hidden" noHover>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-muted-foreground text-xs font-black uppercase border-b border-border">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Branch</th>
                  <th className="px-5 py-4">Contributions</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          <img src={u.image} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-foreground">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        defaultValue={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={isPending}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black border cursor-pointer focus:outline-none ${roleColors[u.role]} bg-transparent`}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground font-medium text-xs">{u.branch ?? '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3 text-xs font-bold text-muted-foreground">
                        <span>{u.notesCount} Notes</span>
                        <span>{u.resourcesCount} Resources</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground font-medium">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete('user', u.id, u.name)}
                        className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-bold">No users found</div>
            )}
          </div>
        </GlassCard>
      )}

      {/* ── NOTES TAB ── */}
      {activeTab === 'Notes' && (
        <GlassCard className="p-0 overflow-hidden" noHover>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-muted-foreground text-xs font-black uppercase border-b border-border">
                <tr>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Subject / Branch</th>
                  <th className="px-5 py-4">Uploader</th>
                  <th className="px-5 py-4">Downloads</th>
                  <th className="px-5 py-4">Uploaded</th>
                  <th className="px-5 py-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredNotes.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 font-bold text-foreground max-w-[200px] truncate">{n.title}</td>
                    <td className="px-5 py-3">
                      <p className="text-xs font-bold text-foreground">{n.subject}</p>
                      <p className="text-[11px] text-muted-foreground">{n.branch} • Sem {n.semester}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground font-medium">{n.uploaderName}</td>
                    <td className="px-5 py-3 text-xs font-bold text-primary">{n.downloads}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(n.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete('note', n.id, n.title)} className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredNotes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-bold">No notes found</div>
            )}
          </div>
        </GlassCard>
      )}

      {/* ── RESOURCES TAB ── */}
      {activeTab === 'Resources' && (
        <GlassCard className="p-0 overflow-hidden" noHover>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-900/80 text-muted-foreground text-xs font-black uppercase border-b border-border">
                <tr>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Category / Type</th>
                  <th className="px-5 py-4">Uploader</th>
                  <th className="px-5 py-4">Downloads</th>
                  <th className="px-5 py-4">Uploaded</th>
                  <th className="px-5 py-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredResources.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 font-bold text-foreground max-w-[200px] truncate">{r.title}</td>
                    <td className="px-5 py-3">
                      <p className="text-xs font-bold text-foreground">{r.category}</p>
                      <p className="text-[11px] text-muted-foreground">{r.type}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground font-medium">{r.uploaderName}</td>
                    <td className="px-5 py-3 text-xs font-bold text-primary">{r.downloads}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{formatDate(r.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDelete('resource', r.id, r.title)} className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredResources.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-bold">No resources found</div>
            )}
          </div>
        </GlassCard>
      )}

      {/* ── GROUPS TAB ── */}
      {activeTab === 'Groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase())).map(g => (
            <GlassCard key={g.id} className="p-5 flex flex-col gap-3" noHover>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-sm text-foreground">{g.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{g.description}</p>
                </div>
                <button onClick={() => handleDelete('group', g.id, g.name)} className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs text-muted-foreground font-bold">
                <span className="flex items-center gap-1"><Users size={12} /> {g.memberCount} members</span>
                <span>{formatDate(g.createdAt)}</span>
              </div>
            </GlassCard>
          ))}
          {groups.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground font-bold">No groups found</div>}
        </div>
      )}

      {/* ── DOUBT BOARD TAB ── */}
      {activeTab === 'Doubt Board' && (
        <div className="space-y-3">
          {questions.filter(q => q.title.toLowerCase().includes(search.toLowerCase())).map(q => (
            <GlassCard key={q.id} className="p-4 flex items-center justify-between gap-4" noHover>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{q.title}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground font-bold">
                  <span>By {q.authorName}</span>
                  <span>{q.answerCount} answers</span>
                  <span>{formatDate(q.createdAt)}</span>
                  {q.solved && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={11} /> Solved</span>}
                </div>
              </div>
              <button onClick={() => handleDelete('question', q.id, q.title)} className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all shrink-0">
                <Trash2 size={14} />
              </button>
            </GlassCard>
          ))}
          {questions.length === 0 && <div className="text-center py-12 text-muted-foreground font-bold">No questions found</div>}
        </div>
      )}

      {/* ── EVENTS TAB ── */}
      {activeTab === 'Events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).map(e => (
            <GlassCard key={e.id} className="p-5 flex flex-col gap-3" noHover>
              <div>
                <h3 className="font-black text-sm text-foreground">{e.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(e.date)}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs text-muted-foreground font-bold">
                <span className="flex items-center gap-1"><UserCheck size={12} /> {e.registrations} registered</span>
              </div>
            </GlassCard>
          ))}
          {events.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground font-bold">No events found</div>}
        </div>
      )}

    </div>
  )
}
