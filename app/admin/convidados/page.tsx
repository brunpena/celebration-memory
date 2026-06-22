import { createClient } from '@/lib/supabase/server'
import { Users, Mail, Phone, MessageSquare } from 'lucide-react'

export default async function GlobalConvidadosPage() {
  const supabase = await createClient()

  const { data: events } = await supabase.from('events').select('id, name')
  const eventIds = (events ?? []).map((e) => e.id)
  const eventNameById = new Map((events ?? []).map((e) => [e.id, e.name]))

  const { data: guests } = eventIds.length
    ? await supabase
        .from('guests')
        .select('id, name, email, phone, message, created_at, event_id, gallery_files(count)')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Convidados</h1>
        <p className="text-gray-500 text-sm mt-1">
          {guests?.length ?? 0} participante{guests?.length !== 1 ? 's' : ''} em todos os eventos
        </p>
      </div>

      {!guests || guests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum convidado ainda</h3>
          <p className="text-gray-500 text-sm">Os convidados aparecerão aqui quando enviarem fotos ou mensagens em algum evento.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Evento</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contato</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Uploads</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mensagem</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {guests.map((g: {
                  id: string
                  name: string | null
                  email: string | null
                  phone: string | null
                  message: string | null
                  created_at: string
                  event_id: string
                  gallery_files: { count: number }[]
                }) => (
                  <tr key={g.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm shrink-0">
                          {(g.name ?? 'A').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{g.name ?? <span className="text-gray-400 italic">Anônimo</span>}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{eventNameById.get(g.event_id) ?? '—'}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        {g.email && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" /> {g.email}
                          </p>
                        )}
                        {g.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" /> {g.phone}
                          </p>
                        )}
                        {!g.email && !g.phone && <span className="text-sm text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {g.gallery_files?.[0]?.count ?? 0} arquivo(s)
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {g.message ? (
                        <p className="text-sm text-gray-600 truncate flex items-start gap-1">
                          <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                          {g.message}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(g.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
