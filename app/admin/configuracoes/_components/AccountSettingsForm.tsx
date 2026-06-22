'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  account: { id: string; name: string; primary_color: string; domain: string | null } | null
}

export default function AccountSettingsForm({ account }: Props) {
  const [name, setName] = useState(account?.name ?? '')
  const [primaryColor, setPrimaryColor] = useState(account?.primary_color ?? '#7c3aed')
  const [domain, setDomain] = useState(account?.domain ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    setError(null)

    if (account?.id) {
      const { error: err } = await supabase.from('accounts').update({
        name: name.trim(),
        primary_color: primaryColor,
        domain: domain.trim() || null,
      }).eq('id', account.id)

      if (err) {
        setError(err.message.includes('domain') ? 'Esse domínio já está em uso.' : 'Não foi possível salvar as configurações.')
        setLoading(false)
        return
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const userName = (user?.user_metadata?.name as string | undefined) || user?.email || 'Usuário'

      const { data: accountId, error: bootstrapError } = await supabase.rpc('bootstrap_account', {
        p_name: userName,
        p_account_name: name.trim(),
      })

      if (bootstrapError || !accountId) {
        setError('Não foi possível criar a agência.')
        setLoading(false)
        return
      }

      const { error: err } = await supabase.from('accounts').update({
        primary_color: primaryColor,
        domain: domain.trim() || null,
      }).eq('id', accountId)

      if (err) {
        setError(err.message.includes('domain') ? 'Esse domínio já está em uso.' : 'Agência criada, mas não foi possível salvar cor/domínio.')
        setLoading(false)
        return
      }
    }

    setSaved(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da agência</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Domínio personalizado</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="fotos.suaagencia.com.br"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cor principal</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer p-1"
          />
          <span className="text-sm text-gray-500 font-mono">{primaryColor}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-600 text-sm">
          Configurações salvas com sucesso!
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
