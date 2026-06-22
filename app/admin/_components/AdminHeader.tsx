'use client'

import { Bell, Menu } from 'lucide-react'

interface Props {
  onMenuClick: () => void
}

export default function AdminHeader({ onMenuClick }: Props) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
      <button onClick={onMenuClick} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition lg:hidden">
        <Menu className="w-5 h-5" />
      </button>
      <div />
      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600">
        <Bell className="w-5 h-5" />
      </button>
    </header>
  )
}
