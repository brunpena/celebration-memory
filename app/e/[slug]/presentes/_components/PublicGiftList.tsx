'use client'

import { useState } from 'react'
import { Gift as GiftIcon, Copy, Check, CheckCircle2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GiftItem {
  id: string
  name: string
  description: string | null
  value: number | null
  image_url: string | null
  category: string | null
  status: string
}

interface Props {
  giftList: {
    id: string
    name: string
    pix_key: string | null
    description: string | null
    gifts: GiftItem[]
  }
}

export default function PublicGiftList({ giftList }: Props) {
  const [gifts, setGifts] = useState(giftList.gifts)
  const [reservingId, setReservingId] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  async function copyPixKey() {
    if (!giftList.pix_key) return
    await navigator.clipboard.writeText(giftList.pix_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleReserve(giftId: string) {
    if (!guestName.trim()) {
      setError('Informe seu nome para reservar.')
      return
    }

    setSubmitting(true)
    setError(null)

    const { error: rpcError } = await supabase.rpc('reserve_gift', {
      p_gift_id: giftId,
      p_guest_name: guestName.trim(),
      p_message: message.trim() || null,
    })

    if (rpcError) {
      setError('Esse presente acabou de ser reservado por outra pessoa. Escolha outro.')
      setGifts((prev) => prev.map((g) => g.id === giftId ? { ...g, status: 'reservado' } : g))
      setSubmitting(false)
      return
    }

    setGifts((prev) => prev.map((g) => g.id === giftId ? { ...g, status: 'reservado' } : g))
    setReservingId(null)
    setGuestName('')
    setMessage('')
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {(giftList.pix_key || giftList.description) && (
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl p-5 space-y-3">
          {giftList.description && (
            <p className="text-sm text-gray-700">{giftList.description}</p>
          )}
          {giftList.pix_key && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-pink-200 px-4 py-3">
              <div>
                <p className="text-xs text-gray-400">Chave PIX</p>
                <p className="text-sm font-medium text-gray-900">{giftList.pix_key}</p>
              </div>
              <button
                onClick={copyPixKey}
                className="flex items-center gap-1.5 text-sm font-medium text-pink-600 hover:text-pink-800 px-3 py-1.5 rounded-lg hover:bg-pink-50 transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {gifts.map((gift) => {
          const isAvailable = gift.status === 'disponivel'
          const isReserving = reservingId === gift.id

          return (
            <div key={gift.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                  <GiftIcon className="w-6 h-6 text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{gift.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {gift.category && <span className="text-xs text-gray-400">{gift.category}</span>}
                    {gift.value && <span className="text-xs text-gray-400">· R$ {gift.value.toFixed(2)}</span>}
                  </div>
                </div>

                {isAvailable ? (
                  <button
                    onClick={() => { setReservingId(gift.id); setError(null) }}
                    className="shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition"
                  >
                    Reservar
                  </button>
                ) : (
                  <span className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    gift.status === 'comprado' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {gift.status === 'comprado'
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Comprado</>
                      : <><Clock className="w-3.5 h-3.5" /> Reservado</>
                    }
                  </span>
                )}
              </div>

              {isReserving && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mensagem para os anfitriões (opcional)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setReservingId(null); setError(null) }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleReserve(gift.id)}
                      disabled={submitting}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
                    >
                      {submitting ? 'Confirmando...' : 'Confirmar reserva'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
