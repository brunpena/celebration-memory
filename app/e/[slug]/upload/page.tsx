import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UploadClient from './_components/UploadClient'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function UploadPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, name, slug, description, date, cover_url, status')
    .eq('slug', slug)
    .single()

  if (!event || event.status === 'arquivado') notFound()

  return <UploadClient event={event} />
}
