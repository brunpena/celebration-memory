'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Archive, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  eventId: string
  eventName: string
}

export default function EventActions({ eventId, eventName }: Props) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<'archive' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setError(null) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleArchive() {
    setBusy('archive')
    setError(null)
    const { error: err } = await supabase.from('events').update({ status: 'arquivado' }).eq('id', eventId)
    setBusy(null)
    if (err) { setError('Não foi possível arquivar o evento.'); return }
    router.refresh()
    setOpen(false)
  }

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir "${eventName}"? Esta ação não pode ser desfeita.`)) return
    setBusy('delete')
    setError(null)
    const { error: err } = await supabase.from('events').delete().eq('id', eventId)
    setBusy(null)
    if (err) { setError('Não foi possível excluir o evento.'); return }
    router.refresh()
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={busy !== null}
        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition disabled:opacity-50"
      >
        {busy !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 z-10 overflow-hidden">
          <button
            onClick={handleArchive}
            disabled={busy !== null}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <Archive className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            {busy === 'archive' ? 'Arquivando...' : 'Arquivar'}
          </button>
          <button
            onClick={handleDelete}
            disabled={busy !== null}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {busy === 'delete' ? 'Excluindo...' : 'Excluir'}
          </button>
          {error && (
            <p className="px-4 py-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-t border-red-100 dark:border-red-500/20">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
