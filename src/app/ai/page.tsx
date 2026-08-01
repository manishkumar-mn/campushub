'use client'

import React, { useState } from 'react'
import GlassCard from '@/components/GlassCard'
import { Sparkles, UploadCloud, Target, Search, FileText, CheckCircle2, ChevronRight, MessageSquare, Briefcase, Code, BookOpen } from 'lucide-react'

export default function AIHubPage() {
  const [activeTab, setActiveTab] = useState<'resume' | 'career'>('career')
  const [resumeState, setResumeState] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [careerQuery, setCareerQuery] = useState('')
  const [careerState, setCareerState] = useState<'idle' | 'generating' | 'done'>('idle')

  const handleAnalyzeResume = () => {
    setResumeState('analyzing')
    setTimeout(() => setResumeState('done'), 2500)
  }

  const handleGenerateRoadmap = (e: React.FormEvent) => {
    e.preventDefault()
    if (!careerQuery.trim()) return
    setCareerState('generating')
    setTimeout(() => setCareerState('done'), 2500)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 flex items-center gap-2">
            <Sparkles className="text-primary" size={28} /> AI Career Hub
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Supercharge your career prep with AI-driven insights and personalized roadmaps.
          </p>
        </div>
        
        <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab('career')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'career' ? 'bg-white dark:bg-slate-700 shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Career Assistant
          </button>
          <button 
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'resume' ? 'bg-white dark:bg-slate-700 shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Resume Analyzer
          </button>
        </div>
      </div>

      {/* Content Areas */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
          
          <GlassCard className="lg:col-span-1 space-y-6">
            <h2 className="font-bold text-xl mb-4">Upload Resume</h2>
            
            <div 
              onClick={resumeState === 'idle' ? handleAnalyzeResume : undefined}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                resumeState === 'idle' 
                  ? 'border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'
              }`}
            >
              {resumeState === 'idle' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                    <UploadCloud size={32} />
                  </div>
                  <h3 className="font-bold text-lg">Click to Upload PDF</h3>
                  <p className="text-xs text-muted-foreground mt-2">Max file size 5MB</p>
                </>
              )}
              {resumeState === 'analyzing' && (
                <div className="flex flex-col items-center py-8">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                  <h3 className="font-bold text-primary animate-pulse">Analyzing with AI...</h3>
                  <p className="text-xs text-muted-foreground mt-2">Parsing keywords and formatting</p>
                </div>
              )}
              {resumeState === 'done' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                    <FileText size={32} />
                  </div>
                  <h3 className="font-bold text-lg">alice_resume_v2.pdf</h3>
                  <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Analysis Complete
                  </p>
                  <button onClick={() => setResumeState('idle')} className="mt-6 text-sm text-primary hover:underline font-medium">
                    Analyze another resume
                  </button>
                </>
              )}
            </div>
          </GlassCard>

          <div className="lg:col-span-2 space-y-6">
            <GlassCard className={`h-full transition-opacity duration-500 ${resumeState === 'done' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                <div>
                  <h2 className="font-bold text-2xl">ATS Analysis Results</h2>
                  <p className="text-muted-foreground text-sm mt-1">Target Role: Software Engineer</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-4 border-emerald-500 flex items-center justify-center flex-col shadow-lg">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">82</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Score</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Target className="text-rose-500" size={18} /> Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Agile', 'GraphQL'].map(kw => (
                      <span key={kw} className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg text-sm font-semibold">
                        {kw}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Adding these keywords can boost your score to 95+ for backend roles.</p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Search className="text-amber-500" size={18} /> Format Issues
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5"><ChevronRight size={14} /></span>
                      <span>Education section should be placed above experience for freshers.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5"><ChevronRight size={14} /></span>
                      <span>Action verbs are missing in bullet point #3 under your React project.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'career' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          
          <GlassCard className="p-2 overflow-hidden shadow-2xl border-primary/20">
            <form onSubmit={handleGenerateRoadmap} className="flex relative">
              <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={24} />
              <input 
                type="text" 
                value={careerQuery}
                onChange={(e) => setCareerQuery(e.target.value)}
                placeholder="E.g., What skills should I learn for a Full Stack Java Developer role?" 
                className="w-full bg-transparent border-none py-6 pl-16 pr-40 text-lg focus:outline-none placeholder:text-muted-foreground/50"
              />
              <button 
                type="submit"
                disabled={!careerQuery.trim() || careerState === 'generating'}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 flex items-center gap-2"
              >
                {careerState === 'generating' ? 'Generating...' : 'Generate AI Roadmap'}
              </button>
            </form>
          </GlassCard>

          <div className={`transition-all duration-700 ${careerState === 'idle' ? 'opacity-0 translate-y-10 pointer-events-none hidden' : 'opacity-100 translate-y-0'}`}>
            {careerState === 'generating' ? (
              <GlassCard className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <Sparkles className="text-primary animate-pulse" size={24} />
                </div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 animate-pulse">
                  Synthesizing your personalized roadmap...
                </h2>
                <p className="text-muted-foreground mt-2">Analyzing industry trends and skill requirements.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-2xl font-bold">Your Learning Roadmap: Full Stack Java Developer</h2>
                  
                  <div className="relative border-l-2 border-primary/30 ml-4 space-y-8 pb-4">
                    
                    <div className="relative pl-8">
                      <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-emerald-500 border-4 border-card flex items-center justify-center text-white shadow-md">
                        <CheckCircle2 size={14} />
                      </div>
                      <GlassCard className="p-5 border-l-4 border-l-emerald-500">
                        <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                          <Code size={18} /> Phase 1: Core Java & OOP
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">You already have this skill from your coursework. Focus on advanced concepts like Multithreading, Collections Framework, and Streams API.</p>
                      </GlassCard>
                    </div>

                    <div className="relative pl-8">
                      <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-primary border-4 border-card flex items-center justify-center text-white shadow-md shadow-primary/50">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                      </div>
                      <GlassCard className="p-5 border-l-4 border-l-primary shadow-xl scale-[1.02]">
                        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                          <Briefcase size={18} /> Phase 2: Spring Boot & Microservices
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 mb-4">This is the industry standard for Java backends. Start immediately.</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md">Spring MVC</span>
                          <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md">Spring Data JPA</span>
                          <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md">REST APIs</span>
                        </div>
                      </GlassCard>
                    </div>

                    <div className="relative pl-8">
                      <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 border-4 border-card shadow-md"></div>
                      <GlassCard className="p-5 border-l-4 border-l-slate-300 dark:border-l-slate-700 opacity-60">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <BookOpen size={18} /> Phase 3: Frontend Integration
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">Connect your backend APIs to a React or Angular frontend interface.</p>
                      </GlassCard>
                    </div>

                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Recommended Resources</h3>
                  <GlassCard className="p-0 overflow-hidden">
                    <a href="#" className="flex items-start gap-3 p-4 border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Spring Boot Masterclass</h4>
                        <p className="text-xs text-muted-foreground mt-1">12 hours • YouTube Course</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-start gap-3 p-4 border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Design Patterns in Java</h4>
                        <p className="text-xs text-muted-foreground mt-1">From CampusHub Library</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Target size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Top 50 Java Interview Questions</h4>
                        <p className="text-xs text-muted-foreground mt-1">Community Notes</p>
                      </div>
                    </a>
                  </GlassCard>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
