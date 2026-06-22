'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  CalendarDays,
  Images,
  Gift,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  X,
  ChevronsUpDown,
} from 'lucide-react'
import { logout } from '@/app/auth/actions'

const navGroups = [
  {
    label: 'Geral',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Eventos',
    items: [
      { href: '/admin/eventos', label: 'Eventos', icon: CalendarDays },
      { href: '/admin/galeria', label: 'Galeria', icon: Images },
      { href: '/admin/convidados', label: 'Convidados', icon: Users },
      { href: '/admin/presentes', label: 'Presentes', icon: Gift },
    ],
  },
  {
    label: 'Análise',
    items: [
      { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
    ],
  },
]

interface Props {
  open: boolean
  onClose: () => void
  user: User
  userName: string | null
  accountName: string | null
  planLabel: string
}

export default function AdminSidebar({ open, onClose, user, userName, accountName, planLabel }: Props) {
  const pathname = usePathname()
  const displayName = userName || user.email || 'Usuário'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 h-full transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Conta */}
        <div className="px-5 pt-6 pb-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-900 dark:text-white font-semibold text-sm leading-tight truncate">
                {accountName || 'Celebration Memory'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-gray-400 dark:text-gray-500 text-xs leading-tight truncate">Celebration Memory</span>
                <span className="text-[10px] font-medium text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                  {planLabel}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white lg:hidden shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800/80 mx-5" />

        {/* Navegação */}
        <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Perfil */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800/80">
          <div className="rounded-2xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/5 p-2">
            <Link
              href="/admin/configuracoes"
              onClick={onClose}
              className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center text-xs font-semibold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 shrink-0" />
            </Link>

            <div className="h-px bg-gray-100 dark:bg-white/5 mx-2 my-1.5" />

            <div className="grid grid-cols-2 gap-1">
              <Link
                href="/admin/configuracoes"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Configurações
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
