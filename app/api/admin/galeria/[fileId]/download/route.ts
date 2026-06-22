import { createClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Não autorizado.', { status: 401 })
  }

  const { data: file } = await supabase
    .from('gallery_files')
    .select('file_url, original_name')
    .eq('id', fileId)
    .single()

  if (!file) {
    return new Response('Arquivo não encontrado.', { status: 404 })
  }

  const response = await fetch(file.file_url)
  if (!response.ok || !response.body) {
    return new Response('Não foi possível baixar o arquivo.', { status: 502 })
  }

  const filename = (file.original_name || file.file_url.split('/').pop() || 'arquivo').replace(/"/g, '')

  return new Response(response.body, {
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
