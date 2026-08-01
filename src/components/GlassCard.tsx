'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  noHover?: boolean
}

export default function GlassCard({ children, className = '', noHover = false, ...props }: GlassCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={noHover ? undefined : { y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      className={`glass-card p-6 ${className}`} 
      {...props}
    >
      {children}
    </motion.div>
  )
}
