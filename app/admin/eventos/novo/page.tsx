'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Type, FileText, Link2, Image } from 'lucide-react'

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function NovoEventoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<'rascunho' | 'ativo'>('rascunho')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugEdited) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: account } = await supabase
      .from('users')
      .select('account_id')
      .eq('id', user.id)
      .single()

    const { error: err } = await supabase.from('events').insert({
      account_id: account?.account_id,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      date: date || null,
      location: location.trim() || null,
      status,
    })

    if (err) {
      setError(err.message.includes('slug') ? 'Esse link já está em uso. Escolha outro.' : err.message)
      setLoading(false)
      return
    }

    await supabase.from('audit_logs').insert({
      account_id: account?.account_id,
      user_id: user.id,
      action: `Evento "${name}" foi criado.`,
    })

    router.push('/admin/eventos')
    router.refresh()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/eventos"
          className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Novo evento</h1>
          <p className="text-gray-500 text-sm mt-0.5">Preencha os dados do evento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-gray-400" /> Nome do evento
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="Ex: Casamento Ana e Pedro"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 text-sm transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-gray-400" /> Link público (slug)
          </label>
          <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent">
            <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/e/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
              required
              placeholder="ana-e-pedro"
              className="flex-1 px-4 py-3 text-sm text-gray-900 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Apenas letras minúsculas, números e hífens</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" /> Data do evento
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 text-sm transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" /> Local
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Salão Primavera, SP"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 text-sm transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-400" /> Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Uma breve descrição do evento..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 text-sm transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <div className="flex gap-3">
            {(['rascunho', 'ativo'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition ${
                  status === s
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                }`}
              >
                {s === 'rascunho' ? 'Rascunho' : 'Publicar agora'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/eventos"
            className="flex-1 py-3 text-center text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !name.trim() || !slug.trim()}
            className="flex-1 py-3 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition"
          >
            {loading ? 'Criando...' : 'Criar evento'}
          </button>
        </div>
      </form>
    </div>
  )
}
