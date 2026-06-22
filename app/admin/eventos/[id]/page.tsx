import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Images, Gift, Users, Settings, ExternalLink, Palette } from 'lucide-react'
import EventEditForm from './_components/EventEditForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const { count: photoCount } = await supabase
    .from('gallery_files')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)
    .eq('file_type', 'photo')

  const { count: videoCount } = await supabase
    .from('gallery_files')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)
    .eq('file_type', 'video')

  const { count: guestCount } = await supabase
    .from('guests')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  const quickLinks = [
    { href: `/admin/eventos/${id}/galeria`, icon: Images, label: 'Galeria', count: (photoCount ?? 0) + (videoCount ?? 0) },
    { href: `/admin/eventos/${id}/convidados`, icon: Users, label: 'Convidados', count: guestCount ?? 0 },
    { href: `/admin/eventos/${id}/presentes`, icon: Gift, label: 'Lista de Presentes', count: null },
    { href: `/admin/eventos/${id}/design`, icon: Palette, label: 'Personalizar página', count: null },
    { href: `/e/${event.slug}`, icon: ExternalLink, label: 'Página pública', count: null, external: true },
  ]

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/eventos" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-gray-500 dark:text-gray-400 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight truncate">{event.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">/{event.slug}</p>
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {quickLinks.map(({ href, icon: Icon, label, count, external }) => (
          <Link
            key={href}
            href={href}
            target={external ? '_blank' : undefined}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col items-center gap-2.5 hover:border-violet-200 dark:hover:border-violet-500/40 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/15 flex items-center justify-center transition">
              <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{label}</span>
            {count !== null && (
              <span className="text-xs text-gray-400 dark:text-gray-500">{count}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Formulário de edição */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Configurações do evento</h2>
        </div>
        <div className="p-6">
          <EventEditForm event={event} />
        </div>
      </div>
    </div>
  )
}
