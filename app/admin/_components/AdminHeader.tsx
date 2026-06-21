'use client'

import type { User } from '@supabase/supabase-js'
import { Bell, Menu } from 'lucide-react'

interface Props {
  user: User
  onMenuClick: () => void
}

export default function AdminHeader({ user, onMenuClick }: Props) {
  const initials = (user.email ?? 'U').slice(0, 2).toUpperCase()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <button onClick={onMenuClick} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition lg:hidden">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-sm text-gray-700 font-medium hidden sm:block">{user.email}</span>
        </div>
      </div>
    </header>
  )
}
