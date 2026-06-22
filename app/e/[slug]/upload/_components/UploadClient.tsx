'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Camera, CheckCircle2, X, Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Event {
  id: string
  name: string
  slug: string
  description: string | null
  date: string | null
  cover_url: string | null
  status: string
}

interface Props {
  event: Event
}

interface FileItem {
  id: string
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

export default function UploadClient({ event }: Props) {
  const [guestName, setGuestName] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [done, setDone] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function addFiles(newFiles: File[]) {
    const items: FileItem[] = newFiles.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
      progress: 0,
      status: 'pending',
    }))
    setFiles((prev) => [...prev, ...items])
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/')))
  }, [])

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  async function handleUpload() {
    if (files.length === 0) return
    setUploading(true)

    // Cria ou busca o guest
    let guestId: string | null = null
    if (guestName.trim() || message.trim()) {
      const { data: guest } = await supabase
        .from('guests')
        .insert({
          event_id: event.id,
          name: guestName.trim() || null,
          message: message.trim() || null,
        })
        .select('id')
        .single()
      guestId = guest?.id ?? null
    }

    for (const item of files) {
      if (item.status === 'done') continue

      setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'uploading' } : f))

      const ext = item.file.name.split('.').pop()
      const path = `${event.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-files')
        .upload(path, item.file, { upsert: false })

      if (uploadError) {
        setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'error', error: uploadError.message } : f))
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('event-files')
        .getPublicUrl(uploadData.path)

      const { error: insertError } = await supabase.from('gallery_files').insert({
        event_id: event.id,
        guest_id: guestId,
        file_url: publicUrl,
        file_type: item.file.type.startsWith('video/') ? 'video' : 'photo',
        file_size: item.file.size,
        original_name: item.file.name,
        is_approved: true,
        is_favorite: false,
      })

      if (insertError) {
        setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'error', error: insertError.message } : f))
        continue
      }

      setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: 'done', progress: 100 } : f))
    }

    setUploading(false)
    setDone(true)
  }

  if (done) {
    const doneCount = files.filter(f => f.status === 'done').length
    const errorCount = files.filter(f => f.status === 'error').length
    const allFailed = doneCount === 0 && errorCount > 0

    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-sm w-full">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${allFailed ? 'bg-red-50' : 'bg-green-50'}`}>
            {allFailed ? <X className="w-10 h-10 text-red-600" /> : <CheckCircle2 className="w-10 h-10 text-green-600" />}
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">
            {allFailed ? 'Não foi possível enviar' : 'Obrigado!'}
          </h2>
          <p className="text-gray-500 mb-2 leading-relaxed">
            {allFailed
              ? 'Nenhum arquivo foi salvo. Verifique sua conexão e tente novamente.'
              : `${doneCount} arquivo(s) enviado(s) com sucesso para o álbum de ${event.name}.`}
          </p>
          {!allFailed && errorCount > 0 && (
            <p className="text-amber-600 text-sm mb-6">{errorCount} arquivo(s) não puderam ser enviados.</p>
          )}
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => {
                if (allFailed) {
                  setDone(false)
                } else {
                  setDone(false)
                  setFiles([])
                }
              }}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white rounded-2xl font-semibold transition"
            >
              {allFailed || errorCount > 0 ? 'Tentar novamente' : 'Enviar mais fotos'}
            </button>
            <Link
              href={`/e/${event.slug}`}
              className="w-full py-3 text-center text-gray-500 hover:text-gray-900 transition text-sm font-medium"
            >
              Voltar ao evento
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/e/${event.slug}`} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 active:scale-95 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{event.name}</p>
            <p className="text-xs text-gray-400">Enviar fotos e vídeos</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-5 pb-28">
        {/* Área de drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition active:scale-[0.99] ${
            dragging
              ? 'border-violet-500 bg-violet-50'
              : 'border-gray-200 bg-white hover:border-violet-400 hover:bg-violet-50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
          />
          <div className="flex justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-violet-600" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="font-semibold text-gray-900 mb-1">Toque para escolher fotos e vídeos</p>
          <p className="text-sm text-gray-500 hidden sm:block">ou arraste os arquivos aqui</p>
          <p className="text-xs text-gray-400 mt-2">JPG, PNG, MP4, MOV — máx. 100MB por arquivo</p>
        </div>

        {/* Preview dos arquivos */}
        {files.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">{files.length} arquivo(s) selecionado(s)</p>
            <div className="grid grid-cols-3 gap-2">
              {files.map((f) => (
                <div key={f.id} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  {f.preview ? (
                    <img src={f.preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  {f.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {f.status === 'done' && (
                    <div className="absolute inset-0 bg-green-600/30 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {f.status === 'error' && (
                    <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                      <X className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {f.status === 'pending' && (
                    <button
                      onClick={() => removeFile(f.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info do convidado */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">Seus dados (opcional)</h3>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Seu nome</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Como você quer ser identificado?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Mensagem (opcional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Deixe uma mensagem carinhosa..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
            />
          </div>
        </div>
      </div>

      {/* Barra de ação fixa */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-xl mx-auto">
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Enviar {files.length > 0 ? `${files.length} arquivo(s)` : 'fotos'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
