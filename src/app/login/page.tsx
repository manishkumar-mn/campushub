'use client'

import React, { useState, useTransition } from 'react'
import { loginAction, loginWithGoogleAction } from '@/app/actions/auth'
import GlassCard from '@/components/GlassCard'
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [isGooglePending, startGoogleTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  const handleGoogleLogin = () => {
    setError(null)
    startGoogleTransition(async () => {
      await loginWithGoogleAction()
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>

      <GlassCard className="w-full max-w-md p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg mx-auto mb-4">
            C
          </div>
          <h1 className="text-2xl font-black">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to access CampusHub.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm font-medium">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isGooglePending || isPending}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 group"
        >
          {isGooglePending ? (
            <Loader2 size={20} className="animate-spin text-primary" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {isGooglePending ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                name="email"
                type="email" 
                defaultValue="student1@campushub.edu"
                required
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                name="password"
                type="password" 
                defaultValue="password123"
                required
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending || isGooglePending}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-primary/25 flex items-center justify-center gap-2 mt-2"
          >
            {isPending ? (
              <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Mock Accounts: <br/>
          <span className="font-medium text-foreground">student1@campushub.edu / password123</span><br/>
          <span className="font-medium text-foreground">admin@campushub.edu / password123</span>
        </div>
      </GlassCard>
    </div>
  )
}
