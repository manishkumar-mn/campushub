'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import Modal from '@/components/Modal'
import { Calendar as CalendarIcon, MapPin, Users, QrCode, ArrowRight, CheckCircle2, Loader2, Clock, CalendarDays, X } from 'lucide-react'
import { registerEventAction } from '@/app/actions/events'

type Event = {
  id: string
  title: string
  description: string
  venue: string
  date: Date
  organizer: string
  image: string | null
}

type EventRegistration = {
  eventId: string
  event: Event
}

// Countdown Timer Component
function EventCountdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      if (difference <= 0) {
        setTimeLeft(null)
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
        Event Started
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
      <Clock size={12} className="animate-pulse" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  )
}

export default function EventsClient({ 
  upcomingEvents, 
  userRegistrations 
}: { 
  upcomingEvents: Event[], 
  userRegistrations: EventRegistration[] 
}) {
  const [isPending, startTransition] = useTransition()
  const [selectedTicket, setSelectedTicket] = useState<Event | null>(null)
  
  const registeredEventIds = new Set(userRegistrations.map(r => r.eventId))

  const handleRegister = (eventId: string) => {
    startTransition(async () => {
      const res = await registerEventAction(eventId)
      if (res?.error) {
        alert(res.error)
      } else {
        // Show ticket modal on successful registration
        const event = upcomingEvents.find(e => e.id === eventId)
        if (event) setSelectedTicket(event)
      }
    })
  }

  const getCalendarLink = (event: Event) => {
    const startDate = new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, "")
    const endDate = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "")
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`
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
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Discover upcoming events, register, and check-in seamlessly.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Event Feed */}
        <motion.div variants={container} className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {upcomingEvents.map((event) => {
                const isRegistered = registeredEventIds.has(event.id)
                
                return (
                  <motion.div key={event.id} variants={item} layout>
                    <GlassCard className="flex flex-col p-0 overflow-hidden group hover:shadow-2xl transition-all duration-300 border border-slate-200/50 dark:border-white/5 h-full">
                      <div className="h-48 bg-slate-100 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                        {event.image ? (
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-purple-600/80 group-hover:scale-105 transition-transform duration-500"></div>
                        )}
                        
                        <div className="absolute top-4 left-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-center shadow-lg border border-slate-200/25 dark:border-white/5">
                          <p className="text-xs font-black text-primary uppercase tracking-wider">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                          <p className="text-2xl font-black leading-none mt-1 text-foreground">{new Date(event.date).getDate()}</p>
                        </div>

                        <div className="absolute top-4 right-4">
                          <EventCountdown targetDate={event.date} />
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors text-foreground">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-medium">
                          {event.description}
                        </p>
                        
                        <div className="space-y-2 mb-6 text-sm font-semibold text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarIcon size={16} className="text-primary" />
                            <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-rose-500" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-indigo-500" />
                            <span className="truncate">Organized by {event.organizer}</span>
                          </div>
                        </div>
                        
                        <div className="mt-auto flex flex-col gap-2">
                          {isRegistered ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setSelectedTicket(event)}
                                className="flex-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all active:scale-95"
                              >
                                <QrCode size={16} /> Show Ticket
                              </button>
                              <a
                                href={getCalendarLink(event)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700/80 p-2.5 rounded-xl transition-all active:scale-95 text-foreground border border-slate-200/50 dark:border-white/5"
                                title="Add to Google Calendar"
                              >
                                <CalendarDays size={18} />
                              </a>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleRegister(event.id)}
                              disabled={isPending}
                              className="w-full bg-primary text-white hover:bg-primary/90 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shadow-lg shadow-primary/25"
                            >
                              {isPending ? <Loader2 size={16} className="animate-spin" /> : <>Register Now <ArrowRight size={16} /></>}
                            </button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {upcomingEvents.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[24px]">
                <CalendarIcon size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-bold text-foreground">No upcoming events.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar Tickets */}
        <motion.div variants={item} className="space-y-6">
          <h2 className="text-xl font-bold">Your Tickets</h2>
          
          <div className="space-y-4">
            <AnimatePresence>
              {userRegistrations.length > 0 ? (
                userRegistrations.map(reg => (
                  <motion.div key={reg.eventId} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <GlassCard className="bg-gradient-to-br from-primary to-indigo-700 text-white border-0 shadow-xl overflow-hidden relative p-6">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-1">Admit One</p>
                            <h3 className="text-xl font-black leading-tight line-clamp-1">{reg.event.title}</h3>
                          </div>
                          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-primary shadow-lg shrink-0 ml-2">
                            <QrCode size={22} />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6 font-semibold">
                          <div>
                            <p className="text-white/60 text-xs">Date</p>
                            <p className="font-bold text-sm">{new Date(reg.event.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs">Time</p>
                            <p className="font-bold text-sm">{new Date(reg.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-white/60 text-xs">Venue</p>
                            <p className="font-bold text-sm truncate">{reg.event.venue}</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-white/20 flex gap-2">
                          <button 
                            onClick={() => setSelectedTicket(reg.event)}
                            className="flex-1 flex items-center justify-center gap-2 text-sm font-bold bg-white text-primary px-4 py-2.5 rounded-xl hover:bg-white/90 transition-all active:scale-95"
                          >
                            View Ticket QR
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              ) : (
                <GlassCard className="text-center py-12" noHover>
                  <QrCode size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-bold text-muted-foreground">You haven't registered for any events yet.</p>
                </GlassCard>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
      </div>

      {/* Ticket Modal with QR Code */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Event Ticket">
        {selectedTicket && (
          <div className="flex flex-col items-center text-center p-4">
            <h3 className="text-2xl font-black text-foreground mb-1">{selectedTicket.title}</h3>
            <p className="text-sm font-bold text-muted-foreground mb-6 flex items-center gap-1.5 justify-center">
              <CalendarIcon size={14} /> {new Date(selectedTicket.date).toLocaleDateString()} at {new Date(selectedTicket.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            
            {/* Elegant Ticket / QR Mockup */}
            <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-white/5 p-6 rounded-2xl shadow-inner mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-background rounded-full border border-slate-200/50 dark:border-white/5 z-10" />
              <div className="absolute top-0 right-0 w-8 h-8 translate-x-1/2 -translate-y-1/2 bg-background rounded-full border border-slate-200/50 dark:border-white/5 z-10" />
              <div className="absolute bottom-0 left-0 w-8 h-8 -translate-x-1/2 translate-y-1/2 bg-background rounded-full border border-slate-200/50 dark:border-white/5 z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 translate-x-1/2 translate-y-1/2 bg-background rounded-full border border-slate-200/50 dark:border-white/5 z-10" />
              
              <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedTicket.id}`}
                  alt="Ticket QR Code" 
                  className="w-40 h-40"
                />
              </div>
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-black mt-3">Scan at registration desk</p>
            </div>

            <div className="w-full space-y-3 font-semibold text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-muted-foreground">Venue</span>
                <span className="text-foreground">{selectedTicket.venue}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-muted-foreground">Organized By</span>
                <span className="text-foreground">{selectedTicket.organizer}</span>
              </div>
            </div>

            <div className="flex w-full gap-3 mt-6">
              <a
                href={getCalendarLink(selectedTicket)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700/80 rounded-xl text-sm font-bold text-foreground transition-all flex items-center justify-center gap-2 border border-slate-200/50 dark:border-white/5"
              >
                <CalendarDays size={16} /> Add to Calendar
              </a>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/25"
              >
                Close Ticket
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
