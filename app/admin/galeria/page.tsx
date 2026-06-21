import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Images } from 'lucide-react'
import GalleryGrid from '@/app/admin/eventos/[id]/galeria/_components/GalleryGrid'

interface Props {
  searchParams: Promise<{ event?: string }>
}

export default async function GlobalGaleriaPage({ searchParams }: Props) {
  const { event: eventFilter } = await searchParams
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, name')
    .order('created_at', { ascending: false })

  const eventIds = eventFilter ? [eventFilter] : (events ?? []).map((e) => e.id)

  const { data: files } = eventIds.length
    ? await supabase
        .from('gallery_files')
        .select('*, guests(name)')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Galeria</h1>
        <p className="text-gray-500 text-sm mt-1">Fotos e vídeos de todos os seus eventos</p>
      </div>

      {!events || events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Images className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum evento criado ainda</h3>
          <p className="text-gray-500 text-sm">Crie um evento para começar a receber fotos e vídeos dos convidados.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/admin/galeria"
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
                !eventFilter ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
              }`}
            >
              Todos os eventos
            </Link>
            {events.map((e) => (
              <Link
                key={e.id}
                href={`/admin/galeria?event=${e.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  eventFilter === e.id ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                }`}
              >
                {e.name}
              </Link>
            ))}
          </div>

          <GalleryGrid files={files ?? []} />
        </>
      )}
    </div>
  )
}
