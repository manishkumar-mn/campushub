'use client'

import React, { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import Modal from '@/components/Modal'
import { 
  User, Mail, GraduationCap, ShieldAlert, LogOut, HelpCircle, 
  MailQuestion, ChevronDown, Check, Loader2, Sparkles, PhoneCall
} from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

type SettingsUser = {
  name: string
  email: string
  image: string | null
  role: string
  branch: string | null | undefined
}

export default function SettingsClient({ user }: { user: SettingsUser }) {
  const [isPending, startTransition] = useTransition()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  
  // Mock Support Form States
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [ticketSuccess, setTicketSuccess] = useState(false)
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketMessage.trim()) return

    setIsSubmittingTicket(true)
    // Mock API delay
    setTimeout(() => {
      setIsSubmittingTicket(false)
      setTicketSuccess(true)
      setTicketSubject('')
      setTicketMessage('')
      setTimeout(() => setTicketSuccess(false), 3000)
    }, 1500)
  }

  const faqs = [
    {
      q: "How do I upload new lecture notes?",
      a: "Go to the 'Notes' page and click on the 'Share Notes' button in the header. Fill in the title, tags, description, and upload your PDF."
    },
    {
      q: "Can I delete or edit my uploaded resources?",
      a: "Yes! Navigate to your profile page, find your uploads in the contribution stats, and select the item to delete or manage."
    },
    {
      q: "How does the doubt board resolution work?",
      a: "If you are the author of a doubt question, you can mark any of the replies as the 'Correct Answer'. This updates the status of the thread to Resolved."
    },
    {
      q: "Who should I contact for security issues?",
      a: "Please email our technical lead directly at ritikji1214@gmail.com for any critical bug reports or security vulnerabilities."
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }
  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Settings & Support</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Manage your account settings, read FAQs, and contact development support.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Account Profile & Actions */}
        <div className="space-y-6 md:col-span-1">
          <motion.div variants={item}>
            <GlassCard className="p-6 text-center" noHover>
              <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-sm">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <h3 className="font-black text-lg text-foreground truncate">{user.name}</h3>
              <p className="text-xs font-bold text-primary tracking-wider uppercase mt-1">{user.role}</p>
              
              <div className="mt-6 space-y-3.5 text-left text-xs font-bold text-muted-foreground border-t border-slate-200/50 dark:border-white/5 pt-5">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-primary shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.branch && (
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-indigo-500 shrink-0" />
                    <span>{user.branch}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-rose-500 shrink-0" />
                  <span>Authorized Account</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={item}>
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl font-black transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              Log Out of Account
            </button>
          </motion.div>
        </div>

        {/* Right Column: Help FAQs & Support Ticket Form */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Help & FAQs Section */}
          <motion.div variants={item}>
            <GlassCard className="p-6" noHover>
              <h2 className="font-black text-lg text-foreground flex items-center gap-2 border-b border-slate-200/50 dark:border-white/5 pb-3">
                <HelpCircle size={18} className="text-primary" />
                Frequently Asked Questions
              </h2>
              
              <div className="mt-4 space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx
                  return (
                    <div 
                      key={idx}
                      className="border border-slate-200/50 dark:border-white/5 rounded-xl overflow-hidden bg-slate-50/30 dark:bg-zinc-900/10"
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-sm text-foreground hover:bg-slate-100/50 dark:hover:bg-zinc-800/30 transition-all"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown 
                          size={16} 
                          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-4 pt-1 text-xs font-semibold text-muted-foreground leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact Support Ticket */}
          <motion.div variants={item}>
            <GlassCard className="p-6" noHover>
              <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-white/5 pb-3">
                <h2 className="font-black text-lg text-foreground flex items-center gap-2">
                  <MailQuestion size={18} className="text-primary" />
                  Contact Support
                </h2>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-md text-[10px] font-black text-primary uppercase">
                  <Sparkles size={11} /> Support desk
                </div>
              </div>

              <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/15 mb-6 text-xs text-muted-foreground font-semibold leading-relaxed">
                Need help or found a problem? Submit a support query below. 
                Our platform lead <span className="font-black text-foreground">Manish Kumar</span> will review your message, 
                or you can reach us directly at <a href="mailto:ritikji1214@gmail.com" className="text-primary font-bold hover:underline">ritikji1214@gmail.com</a>.
              </div>

              <form onSubmit={handleSupportSubmit} className="space-y-4">
                {ticketSuccess && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2 text-xs font-bold"
                  >
                    <Check size={16} /> Support ticket submitted successfully! We'll reply soon.
                  </motion.div>
                )}
                
                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">Subject *</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    placeholder="e.g., Unable to download E-books"
                    className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all font-semibold text-xs text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">Message Details *</label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={e => setTicketMessage(e.target.value)}
                    placeholder="Describe your query in detail..."
                    className="w-full bg-slate-100/50 dark:bg-zinc-900/50 border border-transparent rounded-xl py-3 px-4 focus:outline-none focus:border-primary/30 focus:bg-white dark:focus:bg-zinc-950 transition-all resize-none font-semibold text-xs text-foreground"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTicket || !ticketSubject.trim() || !ticketMessage.trim()}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-primary/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingTicket ? (
                    <><Loader2 size={14} className="animate-spin" /> Submitting query...</>
                  ) : (
                    <><PhoneCall size={14} /> Submit Support Ticket</>
                  )}
                </button>
              </form>
            </GlassCard>
          </motion.div>

        </div>
        
      </div>
      
    </motion.div>
  )
}
