'use client'

import React, { useState, useTransition, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import Modal from '@/components/Modal'
import {
  Mail, Briefcase, GraduationCap, Globe, Link2, Award, FileText,
  UploadCloud, Edit3, CheckCircle2, X, Plus, Loader2, Sparkles,
  Target, Search, ChevronRight, Flame, Trophy, Lock, ShieldAlert, AlertCircle
} from 'lucide-react'
import { updateProfileImageAction } from '@/app/actions/profile'

type User = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  branch: string | null | undefined
}

type Stats = {
  notesUploaded: number
  downloadsReceived: number
  groupsJoined: number
  eventsAttended: number
}

type Props = {
  user: User
  stats: Stats
}

// Simple streak generator (days of current month)
const getStreakDays = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()
  const numDays = new Date(year, month + 1, 0).getDate()
  
  // Return mock completed days (e.g. days 1, 2, 4, 5, 8, 9, 10, 11)
  const activeDays = new Set([1, 2, 4, 5, 8, 9, 10, 11])
  const days = []
  for (let i = 1; i <= numDays; i++) {
    days.push({
      day: i,
      active: activeDays.has(i),
      isToday: i === date.getDate()
    })
  }
  return days
}

export default function ProfileClient({ user, stats }: Props) {
  const [skills, setSkills] = useState(['React', 'Next.js', 'TypeScript', 'Node.js', 'TailwindCSS', 'Prisma', 'Figma'])
  const [bio, setBio] = useState('Passionate software engineering student with a strong focus on building highly interactive, scalable full-stack web applications. I enjoy helping my peers through the Doubt Board and actively contributing study materials for the CS department. Currently looking for summer internship opportunities!')
  const [portfolio, setPortfolio] = useState('')
  const [linkedin, setLinkedin] = useState('')

  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showBioModal, setShowBioModal] = useState(false)
  const [showLinksModal, setShowLinksModal] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [tempBio, setTempBio] = useState(bio)
  const [tempPortfolio, setTempPortfolio] = useState(portfolio)
  const [tempLinkedin, setTempLinkedin] = useState(linkedin)

  // Profile Image Upload States
  const [currentUserImage, setCurrentUserImage] = useState<string | null>(user.image)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const imageFileRef = useRef<HTMLInputElement>(null)

  // Resume Analyzer
  const [resumeState, setResumeState] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const initials = (user.name ?? 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const streakDays = getStreakDays()

  // Skills
  const addSkill = () => {
    const trimmed = newSkill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed])
    }
    setNewSkill('')
  }
  const removeSkill = (skill: string) => setSkills(prev => prev.filter(s => s !== skill))

  // Bio Save
  const saveBio = () => { setBio(tempBio); setShowBioModal(false) }

  // Links Save
  const saveLinks = () => {
    setPortfolio(tempPortfolio)
    setLinkedin(tempLinkedin)
    setShowLinksModal(false)
  }

  // Resume Analyze
  const handleResumeUpload = (file: File) => {
    setResumeFile(file)
    setResumeState('analyzing')
    setTimeout(() => setResumeState('done'), 2500)
  }

  // Profile Image Upload Action
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProfileError(null)
    setIsUploadingImage(true)

    const formData = new FormData()
    formData.append('image', file)

    startTransition(async () => {
      const res = await updateProfileImageAction(formData)
      setIsUploadingImage(false)
      if (res?.success && res.imageUrl) {
        setCurrentUserImage(res.imageUrl)
      } else if (res?.error) {
        setProfileError(res.error)
      }
    })
  }

  // Badges Mock data
  const badges = [
    { id: '1', name: 'Knowledge Seeker', icon: '📚', desc: 'Read 5 study notes', unlocked: true },
    { id: '2', name: 'Elite Contributor', icon: '🔥', desc: 'Uploaded 10 files', unlocked: true },
    { id: '3', name: 'First Steps', icon: '🌱', desc: 'Joined first study group', unlocked: true },
    { id: '4', name: 'Networker', icon: '🤝', desc: 'Attended 3 events', unlocked: true },
    { id: '5', name: 'Bug Hunter', icon: '🐛', desc: 'Resolved a platform issue', unlocked: false },
    { id: '6', name: 'Scholar', icon: '🎓', desc: 'Streak calendar filled for 30 days', unlocked: false },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8 pb-10">

      {profileError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-sm">
          <AlertCircle size={18} /> {profileError}
        </div>
      )}

      {/* Header */}
      <motion.div variants={item} className="relative mt-20">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-64 bg-gradient-to-br from-primary/20 via-purple-500/20 to-transparent blur-3xl -z-10 rounded-[100%]" />

        <GlassCard className="pt-16 pb-8 px-8 flex flex-col items-center text-center relative overflow-visible mt-16" noHover>
          <div className="absolute -top-16 w-32 h-32 rounded-full p-2 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md shadow-xl border border-white/50 dark:border-zinc-700/50 relative group/avatar">
            {currentUserImage ? (
              <img src={currentUserImage} alt={user.name ?? 'User'} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-inner">
                {initials}
              </div>
            )}
            
            <input 
              ref={imageFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadImage}
            />
            
            <button
              onClick={() => imageFileRef.current?.click()}
              disabled={isUploadingImage}
              title="Change profile photo"
              className="absolute bottom-0 right-0 p-2.5 bg-slate-900 dark:bg-zinc-850 text-white rounded-full hover:bg-primary transition-all hover:scale-110 shadow-lg border-2 border-white dark:border-zinc-900 flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {isUploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Edit3 size={14} />}
            </button>
          </div>

          <h1 className="text-3xl font-black mt-2 text-foreground">{user.name}</h1>
          <p className="text-primary font-black tracking-widest uppercase text-xs mt-1">{user.role}</p>

          {/* Gamified Level & XP Section */}
          <div className="w-full max-w-md mt-6 bg-slate-100/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Trophy size={16} className="text-amber-500" />
                Level 4 Explorer
              </span>
              <span className="text-xs font-bold text-muted-foreground">720 / 1000 XP</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '72%' }} />
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 mt-6 text-sm text-muted-foreground font-semibold">
            <span className="flex items-center gap-1.5"><Mail size={16} /> {user.email}</span>
            {user.branch && <span className="flex items-center gap-1.5"><GraduationCap size={16} /> {user.branch}</span>}
            <span className="flex items-center gap-1.5"><Briefcase size={16} /> Student</span>
          </div>

          <div className="flex justify-center gap-3 mt-6 flex-wrap font-bold">
            {portfolio ? (
              <a href={portfolio} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors">
                <Globe size={18} /> Portfolio
              </a>
            ) : (
              <button onClick={() => { setTempPortfolio(portfolio); setTempLinkedin(linkedin); setShowLinksModal(true) }}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-850 text-foreground rounded-xl transition-colors">
                <Globe size={18} /> Add Portfolio
              </button>
            )}
            {linkedin ? (
              <a href={linkedin} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors">
                <Link2 size={18} /> LinkedIn
              </a>
            ) : (
              <button onClick={() => { setTempPortfolio(portfolio); setTempLinkedin(linkedin); setShowLinksModal(true) }}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-850 text-foreground rounded-xl transition-colors">
                <Link2 size={18} /> Add LinkedIn
              </button>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Stats & Streak Calendar */}
        <div className="space-y-8">
          {/* Platform Stats */}
          <motion.div variants={item}>
            <GlassCard className="p-6 space-y-6" noHover>
              <h2 className="font-bold text-lg border-b border-slate-200/50 dark:border-white/5 pb-3 text-foreground">Platform Stats</h2>
              <div className="space-y-4">
                {[
                  { label: 'Notes Uploaded', value: stats.notesUploaded },
                  { label: 'Downloads Received', value: stats.downloadsReceived },
                  { label: 'Groups Joined', value: stats.groupsJoined },
                  { label: 'Events Attended', value: stats.eventsAttended },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm font-semibold">{s.label}</span>
                    <span className="font-black text-lg text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Streak Calendar */}
          <motion.div variants={item}>
            <GlassCard className="p-6" noHover>
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200/50 dark:border-white/5">
                <h2 className="font-bold text-lg text-foreground flex items-center gap-1.5">
                  <Flame className="text-orange-500 animate-bounce" size={20} />
                  Study Streak
                </h2>
                <span className="bg-orange-500/10 text-orange-500 text-xs font-black px-2.5 py-1 rounded-md">
                  7 Days Active
                </span>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-muted-foreground mt-4">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                {streakDays.map((day, idx) => (
                  <div 
                    key={idx} 
                    className={`aspect-square rounded-lg flex items-center justify-center border font-bold transition-all ${
                      day.active 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20' 
                        : day.isToday 
                        ? 'border-primary text-primary dark:bg-primary/10' 
                        : 'bg-slate-100 dark:bg-zinc-900 border-transparent text-muted-foreground'
                    }`}
                  >
                    {day.day}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Right: About, Badges Shelf, AI Resume Analyzer */}
        <div className="lg:col-span-2 space-y-8">

          {/* About Me */}
          <motion.div variants={item}>
            <GlassCard className="p-6" noHover>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-foreground">About Me</h2>
                <button onClick={() => { setTempBio(bio); setShowBioModal(true) }}
                  className="text-primary hover:bg-primary/10 px-2 py-1 rounded-lg text-sm font-bold transition-colors flex items-center gap-1">
                  <Edit3 size={14} /> Edit
                </button>
              </div>
              <p className="text-muted-foreground leading-relaxed font-semibold text-sm">{bio}</p>
            </GlassCard>
          </motion.div>

          {/* Gamified Badges Gallery */}
          <motion.div variants={item}>
            <GlassCard className="p-6" noHover>
              <h2 className="font-bold text-lg pb-3 border-b border-slate-200/50 dark:border-white/5 text-foreground flex items-center gap-2">
                <Award className="text-primary" size={20} />
                Badges Shelf
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                {badges.map(b => (
                  <div 
                    key={b.id} 
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center text-center ${
                      b.unlocked 
                        ? 'bg-primary/5 border-primary/20 hover:scale-105 duration-200 cursor-pointer' 
                        : 'bg-slate-50 dark:bg-zinc-900/30 border-slate-200 dark:border-white/5 opacity-55'
                    }`}
                  >
                    <div className="text-3xl mb-2">{b.icon}</div>
                    <h4 className="font-black text-sm text-foreground">{b.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-snug font-medium">{b.desc}</p>
                    
                    {!b.unlocked && (
                      <div className="absolute top-2 right-2 text-slate-400">
                        <Lock size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Bottom Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Resume Analyzer */}
            <motion.div variants={item}>
              <GlassCard
                onClick={() => setShowResumeModal(true)}
                className="p-6 border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group flex flex-col items-center justify-center text-center h-full"
              >
                <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={28} />
                </div>
                <h3 className="font-bold text-lg text-primary">AI Resume Analyzer</h3>
                <p className="text-xs text-muted-foreground mt-2 px-4 leading-relaxed font-semibold">
                  Upload your resume to get an instant ATS score, keyword analysis, and actionable feedback.
                </p>
              </GlassCard>
            </motion.div>

            {/* Skills */}
            <motion.div variants={item}>
              <GlassCard className="p-6 flex flex-col h-full" noHover>
                <div className="flex justify-between items-center mb-4 border-b border-slate-200/50 dark:border-white/5 pb-3">
                  <h2 className="font-bold text-lg text-foreground">Top Skills</h2>
                  <button onClick={() => setShowSkillsModal(true)}
                    className="text-primary hover:bg-primary/10 px-2.5 py-1 rounded-xl text-sm font-bold transition-all">
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black">
                      {skill}
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-muted-foreground text-sm font-bold">No skills added yet.</p>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Modals */}

      {/* Edit Skills */}
      <Modal isOpen={showSkillsModal} onClose={() => setShowSkillsModal(false)} title="Edit Skills">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="e.g., Python, Docker, SQL..."
              className="flex-1 bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium text-sm" />
            <button onClick={addSkill}
              className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-1">
              <Plus size={16} /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[60px] border border-slate-200/50 dark:border-white/5 rounded-2xl p-3">
            {skills.map(skill => (
              <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-rose-500 transition-colors">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <button onClick={() => setShowSkillsModal(false)}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            Save Skills
          </button>
        </div>
      </Modal>

      {/* Edit Bio */}
      <Modal isOpen={showBioModal} onClose={() => setShowBioModal(false)} title="Edit About Me">
        <div className="space-y-4">
          <textarea value={tempBio} onChange={e => setTempBio(e.target.value)} rows={6}
            className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-3 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all resize-none font-semibold text-sm" />
          <button onClick={saveBio}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            Save Bio
          </button>
        </div>
      </Modal>

      {/* Edit Links */}
      <Modal isOpen={showLinksModal} onClose={() => setShowLinksModal(false)} title="Edit Links">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold block mb-1 flex items-center gap-1"><Globe size={14} /> Portfolio URL</label>
            <input value={tempPortfolio} onChange={e => setTempPortfolio(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium text-sm" />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1 flex items-center gap-1"><Link2 size={14} /> LinkedIn URL</label>
            <input value={tempLinkedin} onChange={e => setTempLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium text-sm" />
          </div>
          <button onClick={saveLinks}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            Save Links
          </button>
        </div>
      </Modal>

      {/* Resume Analyzer */}
      <Modal isOpen={showResumeModal} onClose={() => { setShowResumeModal(false); setResumeState('idle'); setResumeFile(null) }} title="AI Resume Analyzer">
        <div className="space-y-6">
          {resumeState === 'idle' && (
            <div
              onClick={() => resumeInputRef.current?.click()}
              className="border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all hover:border-primary/60"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="font-bold text-lg text-foreground">Click to Upload Resume PDF</h3>
              <p className="text-xs text-muted-foreground mt-2 font-semibold">Max file size 5MB · PDF only</p>
              <input ref={resumeInputRef} type="file" accept=".pdf" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleResumeUpload(e.target.files[0]) }} />
            </div>
          )}

          {resumeState === 'analyzing' && (
            <div className="flex flex-col items-center py-12">
              <div className="w-16 h-16 relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Sparkles className="text-primary animate-pulse" size={24} />
              </div>
              <h3 className="font-bold text-xl text-primary animate-pulse">Analyzing with AI...</h3>
              <p className="text-sm text-muted-foreground mt-2 font-medium">Parsing keywords and formatting</p>
            </div>
          )}

          {resumeState === 'done' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/5 pb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Analyzed: <span className="font-black text-foreground">{resumeFile?.name}</span></p>
                  <h3 className="font-bold text-xl mt-1 text-foreground">ATS Analysis Results</h3>
                </div>
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-4 border-emerald-500 flex items-center justify-center flex-col shadow-lg shrink-0">
                  <span className="text-2.5xl font-black text-emerald-600 dark:text-emerald-400 leading-none">82</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Score</span>
                </div>
              </div>
              <div>
                <h4 className="font-black mb-2 flex items-center gap-2 text-foreground"><Target className="text-rose-500" size={16} /> Missing Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {['Docker', 'AWS', 'CI/CD', 'GraphQL', 'Agile'].map(kw => (
                    <span key={kw} className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold">{kw}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-black mb-2 flex items-center gap-2 text-foreground"><Search className="text-amber-500" size={16} /> Format Suggestions</h4>
                <ul className="space-y-2">
                  {['Education section should be above experience for freshers.', 'Use action verbs in bullet points to improve impact.'].map(s => (
                    <li key={s} className="flex items-start gap-2 text-sm font-semibold text-muted-foreground">
                      <ChevronRight size={14} className="text-amber-500 mt-0.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => { setResumeState('idle'); setResumeFile(null) }}
                className="w-full py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-foreground hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
                Analyze Another Resume
              </button>
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  )
}
