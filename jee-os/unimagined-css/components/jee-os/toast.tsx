'use client'

interface ToastProps {
  message: string
  show: boolean
}

export function Toast({ message, show }: ToastProps) {
  return (
    <div className={`toast-void ${show ? 'show' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
        {message}
      </div>
    </div>
  )
}
