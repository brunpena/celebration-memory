import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DesignEditor from './_components/DesignEditor'
import { normalizePageDesign } from '@/lib/pageDesign'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EventDesignPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, name, slug, description, date, location, page_design')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const { count: photoCount } = await supabase
    .from('gallery_files')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)
    .eq('is_approved', true)

  const { data: giftList } = await supabase
    .from('gift_lists')
    .select('id')
    .eq('event_id', id)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/eventos/${id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition text-gray-500 dark:text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Personalizar página</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{event.name}</p>
        </div>
      </div>

      <DesignEditor
        eventId={id}
        eventSlug={event.slug}
        eventName={event.name}
        description={event.description}
        date={event.date}
        location={event.location}
        initialDesign={normalizePageDesign(event.page_design)}
        photoCount={photoCount ?? 0}
        hasGiftList={Boolean(giftList)}
      />
    </div>
  )
}
