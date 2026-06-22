import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Gift, ArrowRight } from 'lucide-react'

export default async function GlobalPresentesPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, name, slug, gift_lists(id, name, gifts(status))')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Listas de Presentes</h1>
        <p className="text-gray-500 text-sm mt-1">Acompanhe as listas de presentes de cada evento</p>
      </div>

      {!events || events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-pink-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum evento criado ainda</h3>
          <p className="text-gray-500 text-sm">Crie um evento para configurar sua lista de presentes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event: {
            id: string
            name: string
            slug: string
            gift_lists: { id: string; name: string; gifts: { status: string }[] }[]
          }) => {
            const giftList = event.gift_lists?.[0]
            const total = giftList?.gifts.length ?? 0
            const bought = giftList?.gifts.filter((g) => g.status === 'comprado').length ?? 0

            return (
              <Link
                key={event.id}
                href={`/admin/eventos/${event.id}/presentes`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:border-violet-200 hover:shadow-md transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 group-hover:bg-pink-100 flex items-center justify-center transition shrink-0">
                    <Gift className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.name}</p>
                    <p className="text-sm text-gray-400">
                      {giftList ? `${bought}/${total} presentes adquiridos` : 'Nenhuma lista criada'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 transition shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
