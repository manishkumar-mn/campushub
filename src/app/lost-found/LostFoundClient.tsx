'use client'

import React, { useState, useTransition } from 'react'
import Modal from '@/components/Modal'
import GlassCard from '@/components/GlassCard'
import { Search, MapPin, Calendar, Phone, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { reportItemAction, resolveItemAction } from '@/app/actions/lost-found'

type Item = {
  id: string
  itemName: string
  type: string
  location: string
  date: string
  status: string
  contact: string
  image: string | null
}

export default function LostFoundClient({ initialItems, currentUserId }: { initialItems: Item[]; currentUserId: string }) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [showModal, setShowModal] = useState<'LOST' | 'FOUND' | null>(null)
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || item.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('type', showModal!)
    startTransition(async () => {
      const result = await reportItemAction(formData)
      if (result?.error) {
        setFormError(result.error)
      } else {
        setShowModal(null)
        window.location.reload()
      }
    })
  }

  const handleResolve = (itemId: string) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'RESOLVED' } : i))
    resolveItemAction(itemId)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            Lost &amp; Found
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Report lost items or help return found ones.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal('LOST')}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-rose-500/25 flex items-center gap-2"
          >
            <AlertCircle size={18} /> Report Lost
          </button>
          <button
            onClick={() => setShowModal('FOUND')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/25 flex items-center gap-2"
          >
            <CheckCircle2 size={18} /> Report Found
          </button>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by item name or location..."
            className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'LOST', 'FOUND'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${typeFilter === t ? 'bg-primary text-white' : 'bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <GlassCard key={item.id} className="flex flex-col h-full overflow-hidden p-0 group hover:shadow-2xl transition-all duration-300">
            <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
              {item.image ? (
                <img src={item.image} alt={item.itemName} className="w-full h-full object-cover" />
              ) : (
                <Search size={48} className="text-slate-300 dark:text-slate-600" />
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md backdrop-blur-md shadow-sm ${item.type === 'LOST' ? 'bg-rose-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                  {item.type}
                </span>
                {item.status === 'RESOLVED' && (
                  <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-slate-800/90 text-white backdrop-blur-md">
                    Resolved
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-xl font-bold mb-3 line-clamp-1 group-hover:text-primary transition-colors">{item.itemName}</h3>
              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={14} /> <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={14} /> {item.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone size={14} /> {item.contact}
                </div>
              </div>

              {item.status === 'OPEN' && (
                <button
                  onClick={() => handleResolve(item.id)}
                  className="w-full text-sm border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl py-2 font-medium transition-colors"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </GlassCard>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl">
            <Search size={40} className="mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-xl font-bold">Nothing here yet</h3>
            <p className="text-muted-foreground mt-1">Report a lost or found item to get started.</p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={!!showModal}
        onClose={() => setShowModal(null)}
        title={showModal === 'LOST' ? 'Report a Lost Item' : 'Report a Found Item'}
      >
        <form onSubmit={handleReport} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-500 text-sm">
              <AlertCircle size={16} /> {formError}
            </div>
          )}
          <div>
            <label className="text-sm font-bold block mb-1">Item Name *</label>
            <input name="itemName" type="text" required placeholder="e.g., Blue Water Bottle"
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold block mb-1">Location *</label>
              <input name="location" type="text" required placeholder="e.g., Library 2nd Floor"
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">Date *</label>
              <input name="date" type="date" required
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">Contact Info *</label>
            <input name="contact" type="text" required placeholder="Phone number or email"
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          <button type="submit" disabled={isPending}
            className={`w-full py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white ${showModal === 'LOST' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
            {isPending ? <><Loader2 size={18} className="animate-spin" /> Reporting...</> : `Report ${showModal === 'LOST' ? 'Lost' : 'Found'} Item`}
          </button>
        </form>
      </Modal>
    </div>
  )
}
