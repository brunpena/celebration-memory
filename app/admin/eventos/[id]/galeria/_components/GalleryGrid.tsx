'use client'

import { useState } from 'react'
import { Heart, Trash2, Check, Download, Images, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { GalleryFile } from '@/lib/types'

interface Props {
  files: (GalleryFile & { guests?: { name: string | null } | null })[]
}

export default function GalleryGrid({ files }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function toggleFavorite(file: GalleryFile) {
    setLoading(file.id)
    setError(null)
    const { error: err } = await supabase.from('gallery_files').update({ is_favorite: !file.is_favorite }).eq('id', file.id)
    setLoading(null)
    if (err) { setError('Não foi possível atualizar o favorito.'); return }
    router.refresh()
  }

  async function approveFile(file: GalleryFile) {
    setLoading(file.id)
    setError(null)
    const { error: err } = await supabase.from('gallery_files').update({ is_approved: true }).eq('id', file.id)
    setLoading(null)
    if (err) { setError('Não foi possível aprovar o arquivo.'); return }
    router.refresh()
  }

  async function deleteFile(file: GalleryFile) {
    if (!confirm('Excluir este arquivo?')) return
    setLoading(file.id)
    setError(null)
    const { error: err } = await supabase.from('gallery_files').delete().eq('id', file.id)
    setLoading(null)
    if (err) { setError('Não foi possível excluir o arquivo.'); return }
    router.refresh()
  }

  async function deleteSelected() {
    if (!confirm(`Excluir ${selected.size} arquivo(s)?`)) return
    setError(null)
    const { error: err } = await supabase.from('gallery_files').delete().in('id', Array.from(selected))
    if (err) { setError('Não foi possível excluir os arquivos selecionados.'); return }
    setSelected(new Set())
    router.refresh()
  }

  if (files.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Images className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Nenhum arquivo encontrado</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Quando os convidados enviarem fotos e vídeos, eles aparecerão aqui.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center justify-between bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
          <button onClick={() => setError(null)} className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium">Fechar</button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-violet-700 dark:text-violet-400">{selected.size} selecionado(s)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 px-3 py-1 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-500/15 transition"
            >
              Limpar
            </button>
            <button
              onClick={deleteSelected}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir selecionados
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {files.map((file) => (
          <div
            key={file.id}
            className={`group relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden aspect-square cursor-pointer ${
              selected.has(file.id) ? 'ring-2 ring-violet-500' : ''
            }`}
            onClick={() => toggleSelect(file.id)}
          >
            {file.file_type === 'photo' ? (
              <img
                src={file.thumbnail_url ?? file.file_url}
                alt={file.original_name ?? ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-3xl">🎬</span>
              </div>
            )}

            {selected.has(file.id) && (
              <div className="absolute inset-0 bg-violet-600/30 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}

            {!file.is_approved && (
              <span className="absolute top-2 left-2 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full">
                Pendente
              </span>
            )}

            <div className="absolute top-2 right-2 flex gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition">
              {!file.is_approved && (
                <button
                  onClick={(e) => { e.stopPropagation(); approveFile(file) }}
                  disabled={loading === file.id}
                  className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow text-gray-600 hover:bg-green-500 hover:text-white transition"
                  title="Aprovar"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(file) }}
                disabled={loading === file.id}
                className={`w-7 h-7 rounded-lg flex items-center justify-center shadow transition ${
                  file.is_favorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                }`}
                title="Favoritar"
              >
                <Heart className="w-3.5 h-3.5" fill={file.is_favorite ? 'currentColor' : 'none'} />
              </button>
              <a
                href={`/api/admin/galeria/${file.id}/download`}
                download
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow text-gray-600 hover:bg-violet-500 hover:text-white transition"
                title="Baixar"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={(e) => { e.stopPropagation(); deleteFile(file) }}
                disabled={loading === file.id}
                className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow text-gray-600 hover:bg-red-500 hover:text-white transition"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {file.guests?.name && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition">
                <p className="text-white text-xs truncate">{file.guests.name}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
