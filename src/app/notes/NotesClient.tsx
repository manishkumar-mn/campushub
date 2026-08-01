'use client'

import React, { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '@/components/Modal'
import GlassCard from '@/components/GlassCard'
import { Search, Download, Bookmark, Star, Upload, CheckCircle2, BookOpen, AlertCircle, Loader2, Eye, Share2, Filter, ChevronDown, MoreVertical, Flag } from 'lucide-react'
import { uploadNoteAction, bookmarkNoteAction, downloadNoteAction } from '@/app/actions/notes'

type Note = {
  id: string
  title: string
  description: string
  subject: string
  branch: string
  semester: number
  fileUrl: string
  rating: number
  downloadsCount: number
  verified: boolean
  createdAt: Date
  uploader: { id: string; name: string; image: string | null }
}

type NotesClientProps = {
  initialNotes: Note[]
  bookmarkedIds: string[]
}

export default function NotesClient({ initialNotes, bookmarkedIds }: NotesClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [showModal, setShowModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState<Note | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedIds))
  const [searchQuery, setSearchQuery] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBranch = !branchFilter || note.branch === branchFilter
    const matchesSemester = !semesterFilter || note.semester === parseInt(semesterFilter)
    return matchesSearch && matchesBranch && matchesSemester
  })

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await uploadNoteAction(formData)
      if (result?.error) {
        setFormError(result.error)
      } else {
        setShowModal(false)
        window.location.reload()
      }
    })
  }

  const handleBookmark = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    startTransition(async () => {
      await bookmarkNoteAction(noteId)
      setBookmarks(prev => {
        const next = new Set(prev)
        if (next.has(noteId)) next.delete(noteId)
        else next.add(noteId)
        return next
      })
    })
  }

  const handleDownload = (e: React.MouseEvent, noteId: string, fileUrl: string) => {
    e.stopPropagation()
    startTransition(async () => {
      await downloadNoteAction(noteId)
      if (fileUrl !== '#') window.open(fileUrl, '_blank')
    })
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
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
          <h1 className="text-3xl font-bold tracking-tight">Notes Marketplace</h1>
          <p className="text-muted-foreground mt-2 text-lg">Discover, preview, and download verified study materials.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 active:scale-95 flex items-center gap-2"
        >
          <Upload size={18} /> Upload Note
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center" noHover>
          <div className="relative w-full md:flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by subject, title..."
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto relative">
            <div className="relative flex-1 md:w-40 group">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <select
                value={branchFilter}
                onChange={e => setBranchFilter(e.target.value)}
                className="w-full appearance-none bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 pl-9 pr-8 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all text-sm font-medium"
              >
                <option value="">All Branches</option>
                {['CSE', 'ECE', 'IT', 'Mechanical', 'Civil'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
            </div>
            <div className="relative flex-1 md:w-40 group">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <select
                value={semesterFilter}
                onChange={e => setSemesterFilter(e.target.value)}
                className="w-full appearance-none bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 pl-9 pr-8 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all text-sm font-medium"
              >
                <option value="">Any Semester</option>
                {[1,2,3,4,5,6,7,8].map(s => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Notes Grid */}
      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredNotes.map(note => (
            <motion.div key={note.id} variants={item} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}>
              <GlassCard className="flex flex-col h-full group cursor-pointer relative overflow-hidden" onClick={() => setShowPdfModal(note)}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase">
                    {note.subject}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => handleBookmark(e, note.id)}
                      className={`p-1.5 rounded-lg transition-colors ${bookmarks.has(note.id) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                    >
                      <Bookmark size={16} fill={bookmarks.has(note.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={(e) => e.stopPropagation()} className="p-1.5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {note.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{note.description}</p>

                <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="bg-slate-100 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-white/5 px-2 py-1 rounded-md">{note.branch}</span>
                  <span className="bg-slate-100 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-white/5 px-2 py-1 rounded-md">Sem {note.semester}</span>
                  {note.verified && (
                    <span className="flex items-center gap-1 text-emerald-500 ml-auto bg-emerald-500/10 px-2 py-1 rounded-md">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-6 mt-auto">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {note.uploader.name.charAt(0)}
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">{note.uploader.name}</p>
                    <p className="text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-200/50 dark:bg-white/5 mb-4 group-hover:bg-primary/10 transition-colors"></div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1 text-[13px] text-amber-500 font-bold">
                      <Star size={14} fill="currentColor" /> {note.rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1 text-[13px] text-muted-foreground font-semibold">
                      <Download size={14} /> {note.downloadsCount}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowPdfModal(note); }}
                      className="text-muted-foreground bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 p-1.5 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, note.id, note.fileUrl)}
                      className="text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Download size={14} /> Get
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotes.length === 0 && (
          <motion.div variants={item} className="col-span-full py-24 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
              <BookOpen size={40} className="text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No notes found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">Try adjusting your filters or be the first to upload study material for this section!</p>
            <button onClick={() => {setSearchQuery(''); setBranchFilter(''); setSemesterFilter('')}} className="mt-6 text-sm font-bold text-primary hover:underline">
              Clear all filters
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* PDF Preview Modal */}
      <Modal isOpen={!!showPdfModal} onClose={() => setShowPdfModal(null)} title="Note Preview">
        {showPdfModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
              <div>
                <h3 className="font-bold text-lg">{showPdfModal.title}</h3>
                <p className="text-sm text-muted-foreground">{showPdfModal.subject} • {showPdfModal.branch} Sem {showPdfModal.semester}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Share2 size={16} /></button>
                <button className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"><Flag size={16} /></button>
              </div>
            </div>
            
            <div className="w-full h-[60vh] bg-slate-100 dark:bg-zinc-900 rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/5 flex items-center justify-center relative">
              {showPdfModal.fileUrl.endsWith('.pdf') ? (
                <iframe src={showPdfModal.fileUrl} className="w-full h-full" title="PDF Preview" />
              ) : (
                <div className="text-center p-8">
                  <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
                  <h4 className="font-bold">Preview not available</h4>
                  <p className="text-sm text-muted-foreground mt-2">This file type cannot be previewed in the browser. Please download it to view.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowPdfModal(null)} className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-foreground font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                Close
              </button>
              <button onClick={(e) => handleDownload(e, showPdfModal.id, showPdfModal.fileUrl)} className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/25">
                <Download size={18} /> Download File
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload a Note">
        <form onSubmit={handleUpload} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-500 text-sm">
              <AlertCircle size={16} /> {formError}
            </div>
          )}
          <div>
            <label className="text-sm font-bold block mb-1">Title *</label>
            <input name="title" type="text" required placeholder="e.g., Data Structures & Algorithms Notes"
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all" />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">Description *</label>
            <textarea name="description" required rows={3} placeholder="Briefly describe what this note covers..."
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold block mb-1">Subject *</label>
              <input name="subject" type="text" required placeholder="e.g., Computer Science"
                className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all" />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">Branch *</label>
              <select name="branch" required
                className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all text-sm font-medium">
                {['CSE', 'ECE', 'IT', 'Mechanical', 'Civil'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">Semester *</label>
            <select name="semester" required
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all text-sm font-medium">
              {[1,2,3,4,5,6,7,8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">File (PDF)</label>
            <input name="file" type="file" accept=".pdf,.doc,.docx"
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary file:font-bold hover:file:bg-primary/20 transition-all cursor-pointer" />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-primary/25"
          >
            {isPending ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <><Upload size={18} /> Upload Note</>}
          </button>
        </form>
      </Modal>
    </motion.div>
  )
}
