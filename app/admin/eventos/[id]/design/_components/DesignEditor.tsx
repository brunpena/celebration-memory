'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImageIcon, Layout, LayoutTemplate, Plus, Trash2, Upload, X } from 'lucide-react'
import EventPageView from '@/components/EventPageView'
import { ANCHOR_GRID, ANCHOR_LABELS, SIZE_LABELS, createTextBlock } from '@/lib/pageDesign'
import type { EventPageDesign, PageLayout, PageTextBlock, TextAnchor, TextBlockArea, TextBlockSize } from '@/lib/types'

interface Props {
  eventId: string
  eventSlug: string
  eventName: string
  description: string | null
  date: string | null
  location: string | null
  initialDesign: EventPageDesign
  photoCount: number
  hasGiftList: boolean
}

export default function DesignEditor({
  eventId,
  eventSlug,
  eventName,
  description,
  date,
  location,
  initialDesign,
  photoCount,
  hasGiftList,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [design, setDesign] = useState<EventPageDesign>(initialDesign)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const imageKey = design.layout === 'background' ? 'backgroundImageUrl' : 'headerImageUrl'
  const currentImageUrl = design[imageKey]

  function setLayout(layout: PageLayout) {
    setDesign((d) => ({ ...d, layout }))
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `${eventId}/design/${imageKey}-${Date.now()}.${ext}`

    const { data, error: uploadError } = await supabase.storage
      .from('event-files')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Não foi possível enviar a imagem.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('event-files').getPublicUrl(data.path)
    setDesign((d) => ({ ...d, [imageKey]: publicUrl }))
    setUploading(false)
  }

  function removeImage() {
    setDesign((d) => ({ ...d, [imageKey]: null }))
  }

  function addBlock(area: TextBlockArea) {
    setDesign((d) => ({ ...d, textBlocks: [...d.textBlocks, createTextBlock(area)] }))
  }

  function updateBlock(id: string, patch: Partial<PageTextBlock>) {
    setDesign((d) => ({ ...d, textBlocks: d.textBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }))
  }

  function removeBlock(id: string) {
    setDesign((d) => ({ ...d, textBlocks: d.textBlocks.filter((b) => b.id !== id) }))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError(null)

    const { error: err } = await supabase.from('events').update({ page_design: design }).eq('id', eventId)

    setSaving(false)
    if (err) {
      setError('Não foi possível salvar as alterações.')
      return
    }
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar de modificação */}
      <div className="lg:w-80 shrink-0 space-y-5">
        {/* Layout */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Layout da página</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLayout('background')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition ${
                design.layout === 'background'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-300'
              }`}
            >
              <Layout className="w-4 h-4" />
              Plano de fundo único
            </button>
            <button
              type="button"
              onClick={() => setLayout('header')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-medium transition ${
                design.layout === 'header'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-300'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              Header + conteúdo
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {design.layout === 'background'
              ? 'Uma única imagem cobre toda a página, com os textos sobrepostos.'
              : 'O header fica limitado a 1/4 da tela, com o restante das informações abaixo.'}
          </p>
        </div>

        {/* Imagem */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {design.layout === 'background' ? 'Imagem de fundo' : 'Imagem do header'}
          </h2>

          {currentImageUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video">
              <img src={currentImageUrl} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                title="Remover imagem"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500 hover:border-violet-300 hover:text-violet-500 transition disabled:opacity-50"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs font-medium">{uploading ? 'Enviando...' : 'Escolher imagem'}</span>
            </button>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

          {currentImageUrl && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 py-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/10 transition disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Enviando...' : 'Trocar imagem'}
            </button>
          )}
        </div>

        {/* Textos */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Textos na tela</h2>
          </div>

          {design.layout === 'header' ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => addBlock('overlay')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-300 transition"
              >
                <Plus className="w-3.5 h-3.5" /> No header
              </button>
              <button
                type="button"
                onClick={() => addBlock('body')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-300 transition"
              >
                <Plus className="w-3.5 h-3.5" /> No corpo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addBlock('overlay')}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-300 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar texto
            </button>
          )}

          <div className="space-y-4">
            {design.textBlocks.map((block) => (
              <TextBlockEditor
                key={block.id}
                block={block}
                onChange={(patch) => updateBlock(block.id, patch)}
                onRemove={() => removeBlock(block.id)}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {saved && (
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl px-4 py-3 text-green-600 dark:text-green-400 text-sm">
            Página salva com sucesso!
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl transition"
        >
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden h-fit sticky top-6">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs text-gray-400 dark:text-gray-500 text-center border-b border-gray-200 dark:border-gray-700">
            Pré-visualização da página pública
          </div>
          <div className="max-h-[80vh] overflow-y-auto">
            <EventPageView
              name={eventName}
              slug={eventSlug}
              description={description}
              date={date}
              location={location}
              design={design}
              photoCount={photoCount}
              hasGiftList={hasGiftList}
              interactive={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function TextBlockEditor({
  block,
  onChange,
  onRemove,
}: {
  block: PageTextBlock
  onChange: (patch: Partial<PageTextBlock>) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {block.area === 'overlay' ? 'Sobreposto na imagem' : 'Corpo da página'}
        </span>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <textarea
        value={block.content}
        onChange={(e) => onChange({ content: e.target.value })}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
      />

      <div className="grid grid-cols-3 gap-2">
        <select
          value={block.size}
          onChange={(e) => onChange({ size: e.target.value as TextBlockSize })}
          className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        >
          {Object.entries(SIZE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <input
          type="color"
          value={block.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0.5"
        />

        <div className="grid grid-cols-3 gap-0.5 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
          {ANCHOR_GRID.flat().map((anchor) => (
            <button
              key={anchor}
              type="button"
              title={ANCHOR_LABELS[anchor]}
              onClick={() => onChange({ anchor: anchor as TextAnchor })}
              className={`w-full h-4 rounded-sm transition ${
                block.anchor === anchor ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700 hover:bg-violet-200 dark:hover:bg-violet-500/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
