"use client"

import * as React from "react"

const Dialog = ({ open, onOpenChange, children }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog content */}
      <div className="relative z-50">
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ children, className = "" }: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
      {children}
    </div>
  )
}

const DialogHeader = ({ children, className = "" }: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

const DialogTitle = ({ children, className = "" }: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <h2 className={`text-xl font-semibold ${className}`}>
      {children}
    </h2>
  )
}

const DialogDescription = ({ children, className = "" }: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <p className={`text-sm text-muted-foreground mt-2 ${className}`}>
      {children}
    </p>
  )
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } 