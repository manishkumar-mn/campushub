'use client'

import React, { useState, useTransition, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import Modal from '@/components/Modal'
import {
  FileText, Download, Folder, BookOpen, Layers, Loader2,
  X, ImageIcon, FileIcon, UploadCloud, AlertCircle, CheckCircle2, ChevronRight, Eye
} from 'lucide-react'
import { uploadResourceAction, downloadResourceAction } from '@/app/actions/resources'

type Resource = {
  id: string
  title: string
  category: string
  type: string
  fileUrl: string
  downloads: number
  uploaderId: string
  createdAt: Date
}

type SelectedFile = {
  file: File
  preview: string | null
}

function getFileIcon(file: File) {
  if (file.type.startsWith('image/')) return <ImageIcon size={20} className="text-blue-500" />
  if (file.type === 'application/pdf') return <FileText size={20} className="text-rose-500" />
  return <FileIcon size={20} className="text-slate-500 dark:text-slate-400" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ResourcesClient({ initialResources }: { initialResources: Resource[] }) {
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = ['CSE', 'ECE', 'IT', 'Mechanical', 'Civil']
  const types = ['PYQs', 'Syllabus / Manuals', 'Interview Prep', 'NPTEL Notes', 'E-Books', 'Gate Prep', 'Practice Sets']

  const filteredResources = resources.filter(res => {
    let match = true
    if (activeCategory && res.category !== activeCategory) match = false
    if (activeType && res.type !== activeType) match = false
    return match
  })

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    const withPreviews: SelectedFile[] = arr.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }))
    setSelectedFiles(prev => {
      const existing = new Set(prev.map(f => `${f.file.name}_${f.file.size}`))
      return [...prev, ...withPreviews.filter(f => !existing.has(`${f.file.name}_${f.file.size}`))]
    })
  }, [])

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const copy = [...prev]
      if (copy[index].preview) URL.revokeObjectURL(copy[index].preview!)
      copy.splice(index, 1)
      return copy
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    setUploadSuccess(null)

    if (selectedFiles.length === 0) {
      setFormError('Please select at least one file.')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.delete('files')
    selectedFiles.forEach(sf => formData.append('files', sf.file))

    startTransition(async () => {
      const res = await uploadResourceAction(formData)
      if (res.success) {
        setUploadSuccess(`✅ ${res.count} file${res.count! > 1 ? 's' : ''} uploaded successfully!`)
        setSelectedFiles([])
        setTimeout(() => {
          setIsUploadModalOpen(false)
          setUploadSuccess(null)
          window.location.reload()
        }, 1500)
      } else {
        setFormError(res.error ?? 'Upload failed.')
      }
    })
  }

  const handleDownload = (id: string, url: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, downloads: r.downloads + 1 } : r))
    downloadResourceAction(id)
    if (url !== '#') window.open(url, '_blank')
  }

  const openModal = () => {
    setSelectedFiles([])
    setFormError(null)
    setUploadSuccess(null)
    setIsUploadModalOpen(true)
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
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Curated archives of PYQs, Lab Manuals, and Syllabus files.
          </p>
        </div>
        <button
          onClick={openModal}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 active:scale-95 flex items-center gap-2"
        >
          <UploadCloud size={18} /> Submit Resource
        </button>
      </motion.div>

      {/* Category Folders */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <GlassCard
            key={cat}
            noHover
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`flex flex-col items-center justify-center p-6 transition-all cursor-pointer group text-center border-2 ${
              activeCategory === cat 
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                : 'border-transparent hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-zinc-900/50'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
              activeCategory === cat 
                ? 'bg-primary text-white' 
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 group-hover:text-primary group-hover:bg-primary/10'
            }`}>
              <Folder size={32} />
            </div>
            <h3 className="font-bold text-lg text-foreground">{cat}</h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1">
              Explore <ChevronRight size={12} />
            </p>
          </GlassCard>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={container} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="text-primary" />
              {activeCategory || activeType ? 'Filtered Results' : 'Latest Additions'}
            </h2>
            {(activeCategory || activeType) && (
              <button onClick={() => { setActiveCategory(null); setActiveType(null); }} className="text-sm font-bold text-primary hover:underline">
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {filteredResources.length > 0 ? filteredResources.map((res) => (
                <motion.div key={res.id} variants={item} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}>
                  <GlassCard className="flex items-center justify-between p-4 group cursor-pointer" onClick={() => handleDownload(res.id, res.fileUrl)}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{res.title}</h4>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-semibold flex-wrap">
                          <span className="bg-slate-100 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-white/5 px-2 py-0.5 rounded-md text-foreground">{res.category}</span>
                          <span>•</span>
                          <span>{res.type}</span>
                          <span>•</span>
                          <span>{res.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button
                        title={res.fileUrl === '#' ? 'No file' : 'Download'}
                        className={`p-3 rounded-xl transition-colors ${res.fileUrl !== '#' ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white' : 'bg-slate-100/50 dark:bg-slate-800/50 text-muted-foreground cursor-not-allowed'}`}
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )) : (
                <motion.div variants={item} className="py-20 text-center text-muted-foreground border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[24px]">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-bold text-foreground">No resources found.</p>
                  <p className="text-sm mt-2">Adjust your filters or be the first to upload a resource!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick Filters */}
        <motion.div variants={item} className="space-y-6">
          <h2 className="text-xl font-bold">Resource Types</h2>
          <GlassCard noHover>
            <div className="flex flex-wrap gap-2">
              {types.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveType(activeType === tag ? null : tag)}
                  className={`px-4 py-2 text-sm rounded-xl transition-colors font-bold ${
                    activeType === tag 
                      ? 'bg-primary text-white shadow-md shadow-primary/25' 
                      : 'bg-slate-100 dark:bg-zinc-900 text-muted-foreground hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Resources">
        <form onSubmit={handleUpload} className="space-y-5">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-500 text-sm font-medium">
              <AlertCircle size={16} /> {formError}
            </div>
          )}
          {uploadSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <CheckCircle2 size={16} /> {uploadSuccess}
            </div>
          )}

          <div>
            <label className="text-sm font-bold block mb-1">Resource Title *</label>
            <input name="title" type="text" required placeholder="e.g., CSE 4th Sem Syllabus"
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold block mb-1">Department *</label>
              <select name="category" required className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium">
                <option value="">Select Dept</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">Resource Type *</label>
              <select name="type" required className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium">
                <option value="">Select Type</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold block mb-2">Files * <span className="font-normal text-muted-foreground">(Multiple PDF/Images — max 20MB)</span></label>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-slate-200 dark:border-white/10 hover:border-primary/50 hover:bg-primary/5'}`}
            >
              <UploadCloud size={36} className="mx-auto mb-3 text-muted-foreground" />
              <p className="font-bold text-foreground">Click to browse or drag & drop files here</p>
              <p className="text-sm text-muted-foreground mt-1">Upload study materials in bulk</p>
              <input
                ref={fileInputRef}
                type="file"
                name="files"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.ppt,.pptx"
                className="hidden"
                onChange={e => { if (e.target.files) addFiles(e.target.files) }}
              />
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              <p className="text-sm font-bold text-muted-foreground">{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected:</p>
              {selectedFiles.map((sf, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-100 dark:bg-zinc-900/50 rounded-xl p-3 border border-slate-200/50 dark:border-white/5">
                  {sf.preview ? (
                    <img src={sf.preview} alt={sf.file.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
                      {getFileIcon(sf.file)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-foreground">{sf.file.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{formatSize(sf.file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || selectedFiles.length === 0}
            className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            {isPending
              ? <><Loader2 size={18} className="animate-spin" /> Uploading {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}...</>
              : <><UploadCloud size={18} /> Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}` : 'Files'}</>
            }
          </button>
        </form>
      </Modal>
    </motion.div>
  )
}
