import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Images, Download } from 'lucide-react'
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
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Galeria</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Fotos e vídeos de todos os seus eventos</p>
        </div>

        {eventFilter && files && files.length > 0 && (
          <a
            href={`/api/admin/eventos/${eventFilter}/galeria/zip`}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar tudo</span>
            <span className="sm:hidden">.zip</span>
          </a>
        )}
      </div>

      {!events || events.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Images className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Nenhum evento criado ainda</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Crie um evento para começar a receber fotos e vídeos dos convidados.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/admin/galeria"
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
                !eventFilter ? 'bg-violet-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-500/40'
              }`}
            >
              Todos os eventos
            </Link>
            {events.map((e) => (
              <Link
                key={e.id}
                href={`/admin/galeria?event=${e.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  eventFilter === e.id ? 'bg-violet-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-500/40'
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
