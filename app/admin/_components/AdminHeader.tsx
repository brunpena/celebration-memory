'use client'

import { Bell, Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

interface Props {
  onMenuClick: () => void
}

export default function AdminHeader({ onMenuClick }: Props) {
  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 transition-colors">
      <button onClick={onMenuClick} className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition lg:hidden">
        <Menu className="w-5 h-5" />
      </button>
      <div />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
