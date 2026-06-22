import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Gift } from 'lucide-react'
import PublicGiftList from './_components/PublicGiftList'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PublicPresentesPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, name, slug, status')
    .eq('slug', slug)
    .single()

  if (!event || event.status === 'arquivado') notFound()

  const { data: giftList } = await supabase
    .from('gift_lists')
    .select('id, name, pix_key, description, gifts(id, name, description, value, image_url, category, status)')
    .eq('event_id', event.id)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/e/${slug}`} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 active:scale-95 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{event.name}</p>
            <p className="text-xs text-gray-400">Lista de Presentes</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {!giftList || giftList.gifts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-12 text-center">
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lista ainda não disponível</h3>
            <p className="text-gray-500 text-sm">Em breve os organizadores publicarão a lista de presentes.</p>
          </div>
        ) : (
          <PublicGiftList giftList={giftList} />
        )}
      </div>
    </div>
  )
}
