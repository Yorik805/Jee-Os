'use client'

import { 
  LayoutDashboard, 
  BookOpen, 
  Atom, 
  FlaskConical, 
  Calculator,
  School,
  Settings,
  Sparkles,
  LogOut,
  User
} from 'lucide-react'
import type { User as FirebaseUser } from 'firebase/auth'

interface SidebarProps {
  activePage: string
  setActivePage: (page: string) => void
  user?: FirebaseUser | null
  onLogout?: () => Promise<void>
}

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { id: 'tracker', label: 'Question Log', icon: BookOpen, section: 'Overview' },
  { id: 'physics', label: 'Physics', icon: Atom, section: 'Subjects' },
  { id: 'chemistry', label: 'Chemistry', icon: FlaskConical, section: 'Subjects' },
  { id: 'math', label: 'Mathematics', icon: Calculator, section: 'Subjects' },
  { id: 'school', label: 'School Progress', icon: School, section: 'Tools' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'Tools' },
]

export function Sidebar({ activePage, setActivePage, user, onLogout }: SidebarProps) {
  const sections = [...new Set(navItems.map(item => item.section))]

  return (
    <aside className="sidebar-void flex flex-col py-6 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]">
      {/* Logo */}
      <div className="px-6 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] flex items-center justify-center shadow-lg shadow-[var(--neon-purple-dim)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              JEE OS
            </h1>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--neon-purple)] uppercase">
              by Yorik
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 overflow-x-auto lg:overflow-x-visible">
        <div className="flex lg:flex-col gap-1 px-2 lg:px-0">
          {sections.map(section => (
            <div key={section} className="contents lg:block">
              <div className="hidden lg:block px-6 py-3 text-[10px] font-bold tracking-[0.15em] text-[var(--text-ghost)] uppercase">
                {section}
              </div>
              {navItems
                .filter(item => item.section === section)
                .map(item => {
                  const Icon = item.icon
                  const isActive = activePage === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePage(item.id)}
                      className={`nav-item-void whitespace-nowrap ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
            </div>
          ))}
        </div>
      </nav>

      {/* User Section (if logged in with Firebase) */}
      {user && onLogout && (
        <div className="hidden lg:block px-6 py-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-full h-full rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user.displayName || 'Anonymous User'}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {user.email || 'Not signed in'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="hidden lg:block px-6 pt-4 mt-auto border-t border-[var(--border-subtle)]">
        <div className="text-[11px] text-[var(--text-ghost)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
            <span>System Online</span>
          </div>
          <p className="text-[var(--text-muted)] opacity-60">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}