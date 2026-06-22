import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Calendar, Image, Video, ExternalLink } from 'lucide-react'
import EventActions from './_components/EventActions'

async function getEvents() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select(`
      id, name, slug, description, date, location, cover_url, status, created_at,
      gallery_files(count),
      guests(count)
    `)
    .order('created_at', { ascending: false })

  if (!events || events.length === 0) return []

  const { data: files } = await supabase
    .from('gallery_files')
    .select('event_id, file_type')
    .in('event_id', events.map((e) => e.id))

  const videoCountByEvent = new Map<string, number>()
  for (const f of files ?? []) {
    if (f.file_type === 'video') {
      videoCountByEvent.set(f.event_id, (videoCountByEvent.get(f.event_id) ?? 0) + 1)
    }
  }

  return events.map((e) => ({ ...e, videoCount: videoCountByEvent.get(e.id) ?? 0 }))
}

const statusLabel: Record<string, string> = {
  ativo: 'Ativo',
  rascunho: 'Rascunho',
  arquivado: 'Arquivado',
  encerrado: 'Encerrado',
}

const statusColor: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700',
  rascunho: 'bg-yellow-100 text-yellow-700',
  arquivado: 'bg-gray-100 text-gray-600',
  encerrado: 'bg-red-100 text-red-600',
}

export default async function EventosPage() {
  const events = await getEvents()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Eventos</h1>
          <p className="text-gray-500 text-sm mt-1.5">{events.length} evento{events.length !== 1 ? 's' : ''} cadastrado{events.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/eventos/novo"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo evento</span>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 sm:p-16 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Calendar className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum evento criado</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Crie seu primeiro evento para começar a receber fotos e presentes.</p>
          <Link
            href="/admin/eventos/novo"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Criar evento
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {events.map((event: {
            id: string
            name: string
            slug: string
            date: string | null
            cover_url: string | null
            status: string
            gallery_files: { count: number }[]
            guests: { count: number }[]
            videoCount: number
          }) => {
            const totalFiles = event.gallery_files?.[0]?.count ?? 0
            const photoCount = Math.max(totalFiles - event.videoCount, 0)
            const guestCount = event.guests?.[0]?.count ?? 0

            return (
              <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="h-40 bg-gradient-to-br from-violet-100 to-purple-100 relative">
                  {event.cover_url ? (
                    <img
                      src={event.cover_url}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-violet-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[event.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[event.status] ?? event.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>
                  {event.date && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </p>
                  )}

                  <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Image className="w-3.5 h-3.5" />
                      {photoCount} fotos
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Video className="w-3.5 h-3.5" />
                      {event.videoCount} vídeos
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <ExternalLink className="w-3.5 h-3.5" />
                      {guestCount} convidados
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/admin/eventos/${event.id}`}
                      className="flex-1 text-center py-2 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/e/${event.slug}`}
                      target="_blank"
                      className="flex-1 text-center py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
                    >
                      Visualizar
                    </Link>
                    <EventActions eventId={event.id} eventName={event.name} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
