'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Gift, Trash2, CheckCircle2, Circle, Clock, Pencil } from 'lucide-react'

interface GiftListProps {
  eventId: string
  giftList: {
    id: string
    name: string
    pix_key: string | null
    description: string | null
    gifts: GiftItem[]
  } | null
}

interface GiftItem {
  id: string
  name: string
  value: number | null
  category: string | null
  status: string
  quantity: number
}

const statusColor: Record<string, string> = {
  disponivel: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
  reservado: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  comprado: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 line-through',
}

export default function GiftListManager({ eventId, giftList: initialGiftList }: GiftListProps) {
  const [giftList, setGiftList] = useState(initialGiftList)
  const [showAdd, setShowAdd] = useState(false)
  const [giftName, setGiftName] = useState('')
  const [giftValue, setGiftValue] = useState('')
  const [giftCategory, setGiftCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingInfo, setEditingInfo] = useState(false)
  const [pixKey, setPixKey] = useState(initialGiftList?.pix_key ?? '')
  const [description, setDescription] = useState(initialGiftList?.description ?? '')
  const [savingInfo, setSavingInfo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function createList() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('gift_lists')
      .insert({ event_id: eventId, name: 'Lista de Presentes' })
      .select('*, gifts(*)')
      .single()
    setLoading(false)
    if (err || !data) { setError('Não foi possível criar a lista de presentes.'); return }
    setGiftList(data)
  }

  async function addGift() {
    if (!giftList || !giftName.trim()) return
    setLoading(true)
    setError(null)
    const { data: gift, error: err } = await supabase
      .from('gifts')
      .insert({
        gift_list_id: giftList.id,
        name: giftName.trim(),
        value: giftValue ? parseFloat(giftValue) : null,
        category: giftCategory.trim() || null,
        quantity: 1,
        status: 'disponivel',
      })
      .select()
      .single()

    setLoading(false)
    if (err || !gift) { setError('Não foi possível adicionar o presente.'); return }

    setGiftList((prev) => prev ? { ...prev, gifts: [...prev.gifts, gift] } : prev)
    setGiftName('')
    setGiftValue('')
    setGiftCategory('')
    setShowAdd(false)
  }

  async function toggleStatus(gift: GiftItem) {
    setError(null)
    const next = gift.status === 'comprado' ? 'disponivel' : 'comprado'
    const { error: err } = await supabase.from('gifts').update({ status: next }).eq('id', gift.id)
    if (err) { setError('Não foi possível atualizar o status do presente.'); return }
    setGiftList((prev) => prev ? {
      ...prev,
      gifts: prev.gifts.map((g) => g.id === gift.id ? { ...g, status: next } : g)
    } : prev)
  }

  async function deleteGift(giftId: string) {
    if (!confirm('Excluir este presente?')) return
    setDeletingId(giftId)
    setError(null)
    const { error: err } = await supabase.from('gifts').delete().eq('id', giftId)
    setDeletingId(null)
    if (err) { setError('Não foi possível excluir o presente.'); return }
    setGiftList((prev) => prev ? {
      ...prev,
      gifts: prev.gifts.filter((g) => g.id !== giftId)
    } : prev)
  }

  async function saveListInfo() {
    if (!giftList) return
    setSavingInfo(true)
    setError(null)
    const { error: err } = await supabase
      .from('gift_lists')
      .update({ pix_key: pixKey.trim() || null, description: description.trim() || null })
      .eq('id', giftList.id)
    setSavingInfo(false)
    if (err) { setError('Não foi possível salvar a chave PIX e a mensagem.'); return }
    setGiftList((prev) => prev ? { ...prev, pix_key: pixKey.trim() || null, description: description.trim() || null } : prev)
    setEditingInfo(false)
  }

  if (!giftList) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="flex items-center justify-between bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
            <button onClick={() => setError(null)} className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium">Fechar</button>
          </div>
        )}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-pink-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Nenhuma lista criada</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Crie uma lista de presentes para este evento.</p>
          <button
            onClick={createList}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Criando...' : 'Criar lista de presentes'}
          </button>
        </div>
      </div>
    )
  }

  const bought = giftList.gifts.filter(g => g.status === 'comprado').length
  const total = giftList.gifts.length

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center justify-between bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
          <button onClick={() => setError(null)} className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium">Fechar</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{giftList.name}</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500">{bought}/{total} presentes adquiridos</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>

        {/* Barra de progresso */}
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full transition-all"
            style={{ width: total > 0 ? `${(bought / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Chave PIX e mensagem aos convidados</h3>
          {!editingInfo && (
            <button
              onClick={() => setEditingInfo(true)}
              className="flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
          )}
        </div>

        {editingInfo ? (
          <div className="space-y-3">
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Chave PIX (CPF, e-mail, telefone ou aleatória)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Mensagem exibida na página pública (ex: 'Pix também é bem-vindo!')"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditingInfo(false); setPixKey(giftList.pix_key ?? ''); setDescription(giftList.description ?? '') }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={saveListInfo}
                disabled={savingInfo}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
              >
                {savingInfo ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>
              <span className="text-gray-400 dark:text-gray-500">Chave PIX: </span>
              {giftList.pix_key || <span className="text-gray-400 dark:text-gray-500 italic">não definida</span>}
            </p>
            <p>
              <span className="text-gray-400 dark:text-gray-500">Mensagem: </span>
              {giftList.description || <span className="text-gray-400 dark:text-gray-500 italic">não definida</span>}
            </p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-violet-200 dark:border-violet-500/30 shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Novo presente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
              placeholder="Nome do presente"
              className="col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              type="number"
              value={giftValue}
              onChange={(e) => setGiftValue(e.target.value)}
              placeholder="Valor (R$)"
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <input
            type="text"
            value={giftCategory}
            onChange={(e) => setGiftCategory(e.target.value)}
            placeholder="Categoria (ex: Cozinha, Decoração)"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Cancelar
            </button>
            <button
              onClick={addGift}
              disabled={loading || !giftName.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {giftList.gifts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
          Nenhum presente cadastrado. Clique em &quot;Adicionar&quot; para começar.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {giftList.gifts.map((gift) => (
              <div key={gift.id} className="flex items-start sm:items-center gap-3 sm:gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <button
                  onClick={() => toggleStatus(gift)}
                  title={gift.status === 'comprado' ? 'Marcar como disponível' : 'Marcar como comprado'}
                  className="shrink-0 mt-0.5 sm:mt-0 text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition"
                >
                  {gift.status === 'comprado' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {gift.status === 'reservado' && <Clock className="w-5 h-5 text-yellow-500" />}
                  {gift.status === 'disponivel' && <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${gift.status === 'comprado' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                    {gift.name}
                  </p>
                  {gift.category && <p className="text-xs text-gray-400 dark:text-gray-500">{gift.category}</p>}
                  <div className="flex items-center gap-2 mt-1.5 sm:hidden">
                    {gift.value && (
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        R$ {gift.value.toFixed(2)}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[gift.status]}`}>
                      {gift.status}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  {gift.value && (
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      R$ {gift.value.toFixed(2)}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[gift.status]}`}>
                    {gift.status}
                  </span>
                </div>
                <button
                  onClick={() => deleteGift(gift.id)}
                  disabled={deletingId === gift.id}
                  className="shrink-0 p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
