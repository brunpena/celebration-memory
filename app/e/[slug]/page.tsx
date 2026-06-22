import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EventPageView from '@/components/EventPageView'
import { normalizePageDesign } from '@/lib/pageDesign'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EventoPublicoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, name, slug, description, date, location, status, page_design')
    .eq('slug', slug)
    .single()

  if (!event || event.status === 'arquivado') notFound()

  const { count: photoCount } = await supabase
    .from('gallery_files')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('is_approved', true)

  const { data: giftList } = await supabase
    .from('gift_lists')
    .select('id')
    .eq('event_id', event.id)
    .maybeSingle()

  return (
    <EventPageView
      name={event.name}
      slug={event.slug}
      description={event.description}
      date={event.date}
      location={event.location}
      design={normalizePageDesign(event.page_design)}
      photoCount={photoCount ?? 0}
      hasGiftList={Boolean(giftList)}
    />
  )
}
