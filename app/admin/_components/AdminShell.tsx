'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
