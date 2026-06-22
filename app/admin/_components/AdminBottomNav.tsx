'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Images, Users, Gift } from 'lucide-react'

const bottomNavItems = [
  { href: '/admin/eventos', label: 'Eventos', icon: CalendarDays },
  { href: '/admin/galeria', label: 'Galeria', icon: Images },
  { href: '/admin/convidados', label: 'Convidados', icon: Users },
  { href: '/admin/presentes', label: 'Presentes', icon: Gift },
]

export default function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 pb-[env(safe-area-inset-bottom)] shrink-0">
      <div className="grid grid-cols-4">
        {bottomNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                active
                  ? 'text-violet-600 dark:text-violet-300'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
