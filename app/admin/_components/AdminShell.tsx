'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import AdminBottomNav from './AdminBottomNav'
import { ThemeProvider } from './ThemeContext'

interface Props {
  user: User
  userName: string | null
  accountName: string | null
  planLabel: string
  children: React.ReactNode
}

export default function AdminShell({ user, userName, accountName, planLabel, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors">
        <AdminSidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          user={user}
          userName={userName}
          accountName={accountName}
          planLabel={planLabel}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader onMenuClick={() => setMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 pb-24 lg:pb-10">
              {children}
            </div>
          </main>
          <AdminBottomNav />
        </div>
      </div>
    </ThemeProvider>
  )
}
