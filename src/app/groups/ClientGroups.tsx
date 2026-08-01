'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '@/components/Modal'
import GlassCard from '@/components/GlassCard'
import { Search, Hash, Plus, Users, Send, MoreVertical, Loader2, AlertCircle, Sparkles, Check } from 'lucide-react'
import { sendMessageAction, createGroupAction, joinGroupAction } from '@/app/actions/groups'

interface Group {
  id: string
  name: string
  description: string
  category: string
  memberCount: number
  isMember: boolean
}

interface Message {
  id: string
  content: string
  createdAt: Date
  sender: { id: string; name: string; image: string | null }
}

interface Props {
  initialGroups: Group[]
  initialMessages: Message[]
  currentUser: { id: string; name: string; image: string | null }
}

// Helper for generating mock avatars
const mockAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format&q=60',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format&q=60',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format&q=60',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&fit=crop&auto=format&q=60',
]

export default function ClientGroups({ initialGroups, initialMessages, currentUser }: Props) {
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [activeGroup, setActiveGroup] = useState<Group | null>(initialGroups[0] ?? null)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSending, startSendTransition] = useTransition()
  const [isCreating, startCreateTransition] = useTransition()
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredGroups = groups.filter(g =>
    !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleGroupSwitch = (group: Group) => {
    setActiveGroup(group)
    setMessages([])
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !activeGroup) return

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      content: messageText,
      createdAt: new Date(),
      sender: { id: currentUser.id, name: currentUser.name, image: currentUser.image },
    }
    setMessages(prev => [...prev, optimisticMsg])
    const content = messageText
    setMessageText('')

    startSendTransition(async () => {
      const result = await sendMessageAction(activeGroup.id, content)
      if (result?.success && result.message) {
        setMessages(prev =>
          prev.map(m => m.id === optimisticMsg.id ? {
            id: result.message.id,
            content: result.message.content,
            createdAt: new Date(result.message.createdAt),
            sender: result.message.sender,
          } : m)
        )
      }
    })
  }

  const handleCreateGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    startCreateTransition(async () => {
      const result = await createGroupAction(formData)
      if (result?.error) {
        setFormError(result.error)
      } else {
        setShowCreateModal(false)
        window.location.reload()
      }
    })
  }

  const handleJoin = (groupId: string) => {
    setJoiningId(groupId)
    joinGroupAction(groupId).then(() => {
      setGroups(prev => prev.map(g =>
        g.id === groupId ? { ...g, isMember: true, memberCount: g.memberCount + 1 } : g
      ))
      if (activeGroup?.id === groupId) {
        setActiveGroup(prev => prev ? { ...prev, isMember: true, memberCount: prev.memberCount + 1 } : null)
      }
      setJoiningId(null)
    }).catch(() => setJoiningId(null))
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }
  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 max-w-7xl mx-auto pb-6">

      {/* Groups Sidebar */}
      <GlassCard className="w-80 flex flex-col p-0 overflow-hidden shrink-0 hidden md:flex border border-slate-200/50 dark:border-white/5 shadow-xl">
        <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/20">
          <h2 className="font-black text-base flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            Study Hub
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all active:scale-90"
            title="Create Group"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200/50 dark:border-white/5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search workspaces..."
              className="w-full bg-slate-100 dark:bg-zinc-900 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium"
            />
          </div>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {filteredGroups.map(group => {
            const isSelected = activeGroup?.id === group.id
            return (
              <motion.div key={group.id} variants={item} layout>
                <div
                  onClick={() => handleGroupSwitch(group)}
                  className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer relative overflow-hidden group/item ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/20 shadow-sm'
                      : 'border border-transparent hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  {/* Indicator for online activity (Mocked dynamic green pulse) */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-black shadow-md">
                      {group.name.charAt(0)}
                    </div>
                    {group.memberCount > 2 && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm truncate text-foreground group-hover/item:text-primary transition-colors">{group.name}</h3>
                    </div>
                    
                    {/* Avatar stack mockup */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {mockAvatars.slice(0, Math.min(3, group.memberCount)).map((src, i) => (
                          <img
                            key={i}
                            className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-background object-cover"
                            src={src}
                            alt="member avatar"
                          />
                        ))}
                        {group.memberCount > 3 && (
                          <div className="h-4.5 w-4.5 rounded-full bg-slate-200 dark:bg-zinc-700 ring-2 ring-background flex items-center justify-center text-[7px] font-black text-muted-foreground shrink-0">
                            +{group.memberCount - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-muted-foreground px-2 py-0.5 rounded-md font-bold">
                        {group.category}
                      </span>
                    </div>
                  </div>

                  {!group.isMember && (
                    <button
                      onClick={e => { e.stopPropagation(); handleJoin(group.id) }}
                      className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-lg font-black hover:bg-primary hover:text-white transition-all shrink-0 active:scale-95 flex items-center gap-1"
                    >
                      {joiningId === group.id ? <Loader2 size={12} className="animate-spin" /> : 'Join'}
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}

          {filteredGroups.length === 0 && (
            <div className="py-10 text-center text-muted-foreground text-sm font-medium">
              No rooms found.
            </div>
          )}
        </motion.div>
      </GlassCard>

      {/* Chat Workspace */}
      <AnimatePresence mode="wait">
        {activeGroup ? (
          <motion.div
            key={activeGroup.id}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex"
          >
            <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border border-slate-200/50 dark:border-white/5 shadow-xl">
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between bg-white/40 dark:bg-zinc-950/20 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-black shadow-md">
                    #
                  </div>
                  <div>
                    <h2 className="font-black text-foreground">{activeGroup.name}</h2>
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <Users size={12} className="text-primary" /> {activeGroup.memberCount} members online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!activeGroup.isMember && (
                    <button
                      onClick={() => handleJoin(activeGroup.id)}
                      className="text-xs bg-primary hover:bg-primary/95 text-white px-3.5 py-2 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-primary/10"
                    >
                      {joiningId === activeGroup.id ? <Loader2 size={12} className="animate-spin" /> : 'Join Room'}
                    </button>
                  )}
                  <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-muted-foreground hover:text-foreground transition-all">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Hash size={32} />
                    </div>
                    <p className="font-black text-lg text-foreground">Welcome to #{activeGroup.name}!</p>
                    <p className="text-sm font-medium mt-1">This is the start of this classroom. Send a message to get started.</p>
                  </div>
                )}
                
                {messages.map((msg, index) => {
                  const isMine = msg.sender.id === currentUser.id
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`flex items-end gap-2.5 max-w-[75%] ${isMine ? 'flex-row-reverse' : ''}`}>
                        {!isMine && (
                          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-foreground text-xs font-black shrink-0 border border-slate-300/30 dark:border-white/5">
                            {msg.sender.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          {!isMine && (
                            <p className="text-xs text-muted-foreground ml-1 mb-1 font-bold">{msg.sender.name}</p>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl ${
                            isMine
                              ? 'bg-primary text-white rounded-br-none shadow-md shadow-primary/10 font-medium'
                              : 'bg-slate-100 dark:bg-zinc-900 text-foreground border border-slate-200/50 dark:border-white/5 rounded-bl-none font-medium'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                      <p className={`text-[10px] text-muted-foreground mt-1 mx-11 font-bold`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </motion.div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/40 dark:bg-zinc-950/20 shrink-0">
                {activeGroup.isMember ? (
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        placeholder={`Message #${activeGroup.name}...`}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 pl-5 pr-5 text-sm focus:outline-none focus:border-primary/50 shadow-inner font-medium text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!messageText.trim() || isSending}
                      className="p-3.5 bg-primary text-white rounded-2xl hover:bg-primary/95 transition-all disabled:opacity-50 shadow-lg shadow-primary/25 active:scale-95 shrink-0"
                    >
                      {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-2 text-sm font-bold text-muted-foreground">
                    You must join #{activeGroup.name} to send messages.
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <GlassCard className="flex-1 flex items-center justify-center text-muted-foreground font-bold">
            Select a hub to start chatting
          </GlassCard>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create a Study Group">
        <form onSubmit={handleCreateGroup} className="space-y-5">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-500 text-sm font-medium">
              <AlertCircle size={16} /> {formError}
            </div>
          )}
          <div>
            <label className="text-sm font-bold block mb-1">Group Name *</label>
            <input name="name" type="text" required placeholder="e.g., DSA Prep Squad"
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium" />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">Description *</label>
            <textarea name="description" required rows={3} placeholder="What is this group about?"
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all resize-none font-medium" />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">Category *</label>
            <select name="category" required
              className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-semibold text-sm">
              {['Web Dev', 'DSA', 'Machine Learning', 'Exam Prep', 'Research', 'Placement Prep', 'Open Source', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={isCreating}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/25">
            {isCreating ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : 'Create Group'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
