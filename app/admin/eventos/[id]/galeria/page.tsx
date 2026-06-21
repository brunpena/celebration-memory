import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GalleryGrid from './_components/GalleryGrid'
import GalleryTabs from './_components/GalleryTabs'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function GaleriaPage({ params, searchParams }: Props) {
  const { id } = await params
  const { tab = 'todos' } = await searchParams
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, name, slug')
    .eq('id', id)
    .single()

  if (!event) notFound()

  let query = supabase
    .from('gallery_files')
    .select('*, guests(name)')
    .eq('event_id', id)
    .order('created_at', { ascending: false })

  if (tab === 'fotos') query = query.eq('file_type', 'photo')
  else if (tab === 'videos') query = query.eq('file_type', 'video')
  else if (tab === 'favoritos') query = query.eq('is_favorite', true)
  else if (tab === 'pendentes') query = query.eq('is_approved', false)

  const { data: files } = await query

  const { count: totalPhotos } = await supabase.from('gallery_files').select('*', { count: 'exact', head: true }).eq('event_id', id).eq('file_type', 'photo')
  const { count: totalVideos } = await supabase.from('gallery_files').select('*', { count: 'exact', head: true }).eq('event_id', id).eq('file_type', 'video')
  const { count: totalFavorites } = await supabase.from('gallery_files').select('*', { count: 'exact', head: true }).eq('event_id', id).eq('is_favorite', true)
  const { count: totalPending } = await supabase.from('gallery_files').select('*', { count: 'exact', head: true }).eq('event_id', id).eq('is_approved', false)

  const counts = {
    todos: (totalPhotos ?? 0) + (totalVideos ?? 0),
    fotos: totalPhotos ?? 0,
    videos: totalVideos ?? 0,
    favoritos: totalFavorites ?? 0,
    pendentes: totalPending ?? 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/eventos/${id}`} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeria</h1>
          <p className="text-gray-500 text-sm mt-0.5">{event.name}</p>
        </div>
      </div>

      <GalleryTabs activeTab={tab} counts={counts} eventId={id} />

      <GalleryGrid files={files ?? []} />
    </div>
  )
}
