import { Readable } from 'node:stream'
import { ZipArchive } from 'archiver'
import { createClient } from '@/lib/supabase/server'

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-')
}

function uniqueName(used: Set<string>, original: string | null, fallback: string) {
  let name = sanitizeFilename(original || fallback)
  if (!used.has(name)) {
    used.add(name)
    return name
  }

  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ''
  let i = 2
  while (used.has(name)) {
    name = `${base}-${i}${ext}`
    i++
  }
  used.add(name)
  return name
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Não autorizado.', { status: 401 })
  }

  const { data: event } = await supabase
    .from('events')
    .select('id, name, slug')
    .eq('id', id)
    .single()

  if (!event) {
    return new Response('Evento não encontrado.', { status: 404 })
  }

  const { data: files } = await supabase
    .from('gallery_files')
    .select('file_url, original_name, created_at')
    .eq('event_id', id)
    .order('created_at', { ascending: true })

  if (!files || files.length === 0) {
    return new Response('Nenhum arquivo encontrado para este evento.', { status: 404 })
  }

  const archive = new ZipArchive({ zlib: { level: 9 } })
  archive.on('error', () => {})
  const usedNames = new Set<string>()

  ;(async () => {
    for (const [index, file] of files.entries()) {
      try {
        const response = await fetch(file.file_url)
        if (!response.ok || !response.body) continue
        const name = uniqueName(usedNames, file.original_name, `arquivo-${index + 1}`)
        archive.append(Readable.fromWeb(response.body as never), { name })
      } catch {
        // Ignora arquivos que falharem ao baixar e segue com os demais
      }
    }
    await archive.finalize()
  })()

  const filename = `${sanitizeFilename(event.slug || event.name)}-galeria.zip`

  return new Response(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
