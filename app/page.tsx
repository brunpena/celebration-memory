import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  let user = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.error('Falha ao verificar sessão do usuário:', error)
  }

  if (user) {
    redirect('/admin/dashboard')
  } else {
    redirect('/auth/login')
  }
}
