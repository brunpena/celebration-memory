import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/app/admin/_components/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('name, role, accounts(name, plan_id)')
    .eq('id', user.id)
    .maybeSingle()

  const accountsRelation = profile?.accounts as { name: string; plan_id: string | null } | { name: string; plan_id: string | null }[] | null
  const accountInfo = Array.isArray(accountsRelation) ? accountsRelation[0] ?? null : accountsRelation

  return (
    <AdminShell
      user={user}
      userName={profile?.name ?? null}
      accountName={accountInfo?.name ?? null}
      planLabel={accountInfo?.plan_id ? 'Pro' : 'Free'}
    >
      {children}
    </AdminShell>
  )
}
