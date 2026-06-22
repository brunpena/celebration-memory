import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GiftListManager from './_components/GiftListManager'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PresentesPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, name, slug')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const { data: giftList } = await supabase
    .from('gift_lists')
    .select('*, gifts(*)')
    .eq('event_id', id)
    .maybeSingle()

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href={`/admin/eventos/${id}`} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Lista de Presentes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{event.name}</p>
        </div>
      </div>

      <GiftListManager eventId={id} giftList={giftList} />
    </div>
  )
}
