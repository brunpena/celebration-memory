'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

interface Props {
  user: User
  children: React.ReactNode
}

export default function AdminShell({ user, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
