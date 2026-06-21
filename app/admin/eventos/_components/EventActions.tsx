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
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleArchive() {
    setBusy('archive')
    await supabase.from('events').update({ status: 'arquivado' }).eq('id', eventId)
    router.refresh()
    setBusy(null)
    setOpen(false)
  }

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir "${eventName}"? Esta ação não pode ser desfeita.`)) return
    setBusy('delete')
    await supabase.from('events').delete().eq('id', eventId)
    router.refresh()
    setBusy(null)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={busy !== null}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition disabled:opacity-50"
      >
        {busy !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
          <button
            onClick={handleArchive}
            disabled={busy !== null}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Archive className="w-4 h-4 text-gray-400" />
            {busy === 'archive' ? 'Arquivando...' : 'Arquivar'}
          </button>
          <button
            onClick={handleDelete}
            disabled={busy !== null}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {busy === 'delete' ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      )}
    </div>
  )
}
