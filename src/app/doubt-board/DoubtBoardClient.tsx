'use client'

import React, { useState, useTransition } from 'react'
import Modal from '@/components/Modal'
import GlassCard from '@/components/GlassCard'
import { MessageSquare, ArrowUp, ArrowDown, CheckCircle2, User, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { askQuestionAction, voteAction } from '@/app/actions/doubt-board'

type Answer = { id: string; isBest: boolean }
type Question = {
  id: string
  title: string
  description: string
  tags: string
  votes: number
  anonymous: boolean
  createdAt: Date
  user: { name: string }
  answers: Answer[]
}

type Props = { initialQuestions: Question[] }

export default function DoubtBoardClient({ initialQuestions }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'All' | 'Unanswered' | 'Resolved'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const [votingId, setVotingId] = useState<string | null>(null)

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !searchQuery ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.toLowerCase().includes(searchQuery.toLowerCase())
    if (filter === 'Unanswered') return matchesSearch && q.answers.length === 0
    if (filter === 'Resolved') return matchesSearch && q.answers.some(a => a.isBest)
    return matchesSearch
  })

  const handleAskQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await askQuestionAction(formData)
        setShowModal(false)
        window.location.reload()
      } catch {
        setFormError('Something went wrong. Please try again.')
      }
    })
  }

  const handleVote = (questionId: string, direction: 'up' | 'down') => {
    setVotingId(questionId)
    startTransition(async () => {
      await voteAction(questionId, direction)
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, votes: q.votes + (direction === 'up' ? 1 : -1) } : q
      ))
      setVotingId(null)
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            Doubt Board
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Ask questions publicly or anonymously and get peer answers.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary/25"
        >
          Ask a Question
        </button>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search doubts, tags, or concepts..."
            className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {(['All', 'Unanswered', 'Resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white shadow-md' : 'bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Question List */}
      <div className="space-y-4">
        {filteredQuestions.map(q => {
          const hasBestAnswer = q.answers.some(a => a.isBest)
          const isVoting = votingId === q.id
          return (
            <GlassCard key={q.id} className="p-5 flex gap-4 hover:border-primary/30 transition-colors group">
              {/* Voting */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button
                  onClick={() => handleVote(q.id, 'up')}
                  disabled={isVoting}
                  className="p-1.5 rounded-full hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-colors disabled:opacity-50"
                >
                  <ArrowUp size={20} />
                </button>
                <span className="font-bold text-lg">{q.votes}</span>
                <button
                  onClick={() => handleVote(q.id, 'down')}
                  disabled={isVoting}
                  className="p-1.5 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50"
                >
                  <ArrowDown size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors cursor-pointer leading-tight">
                    {q.title}
                  </h3>
                  {hasBestAnswer && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md shrink-0">
                      <CheckCircle2 size={14} /> Resolved
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{q.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {q.tags.split(',').map(tag => (
                      <span key={tag} className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} /> {q.answers.length} Answers
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} /> {q.anonymous ? 'Anonymous' : q.user.name}
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <Clock size={14} /> {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )
        })}

        {filteredQuestions.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <MessageSquare size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold">No questions yet</h3>
            <p className="text-muted-foreground">Be the first to post a question!</p>
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ask a Question">
        <form onSubmit={handleAskQuestion} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-500 text-sm">
              <AlertCircle size={16} /> {formError}
            </div>
          )}
          <div>
            <label className="text-sm font-bold block mb-1">Question Title *</label>
            <input name="title" type="text" required placeholder="e.g., How do I implement a Red-Black Tree?"
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">Description *</label>
            <textarea name="description" required rows={4} placeholder="Provide details about your doubt..."
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">Tags (comma-separated)</label>
            <input name="tags" type="text" placeholder="e.g., DSA, Trees, C++"
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input name="anonymous" type="checkbox" className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm font-medium">Post anonymously</span>
          </label>
          <button type="submit" disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isPending ? <><Loader2 size={18} className="animate-spin" /> Posting...</> : 'Post Question'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
