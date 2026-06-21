import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Camera, Gift } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EventoPublicoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, name, slug, description, date, location, cover_url, status')
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
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 overflow-hidden">
        {event.cover_url && (
          <img
            src={event.cover_url}
            alt={event.name}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">{event.name}</h1>

          <div className="flex flex-col sm:flex-row gap-3 mt-3 text-white/80 text-sm">
            {event.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(event.date).toLocaleDateString('pt-BR', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {event.description && (
          <p className="text-gray-600 text-center leading-relaxed">{event.description}</p>
        )}

        {/* Botões principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/e/${slug}/upload`}
            className="flex flex-col items-center gap-3 p-8 bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-2 border-violet-200 hover:border-violet-400 rounded-2xl transition group"
          >
            <div className="w-14 h-14 rounded-2xl bg-violet-600 group-hover:bg-violet-500 flex items-center justify-center transition">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-lg">Enviar Fotos</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {photoCount ? `${photoCount} foto${photoCount !== 1 ? 's' : ''} enviada${photoCount !== 1 ? 's' : ''}` : 'Seja o primeiro a enviar!'}
              </p>
            </div>
          </Link>

          {giftList && (
            <Link
              href={`/e/${slug}/presentes`}
              className="flex flex-col items-center gap-3 p-8 bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border-2 border-pink-200 hover:border-pink-400 rounded-2xl transition group"
            >
              <div className="w-14 h-14 rounded-2xl bg-pink-500 group-hover:bg-pink-400 flex items-center justify-center transition">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 text-lg">Lista de Presentes</p>
                <p className="text-sm text-gray-500 mt-0.5">Presenteie com carinho</p>
              </div>
            </Link>
          )}
        </div>

        <p className="text-center text-xs text-gray-300">
          Powered by Celebration Memory
        </p>
      </div>
    </div>
  )
}
