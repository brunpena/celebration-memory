import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Settings, Users, Shield, Bell } from 'lucide-react'
import AccountSettingsForm from './_components/AccountSettingsForm'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userRecord } = await supabase
    .from('users')
    .select('*, accounts(*)')
    .eq('id', user?.id ?? '')
    .single()

  const account = userRecord?.accounts ?? null

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie os dados da sua conta e agência</p>
      </div>

      {/* Dados da conta */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Dados da agência</h2>
        </div>
        <div className="p-6">
          <AccountSettingsForm account={account} />
        </div>
      </div>

      {/* Plano atual */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Plano atual</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{account?.plan_id ? 'Pro' : 'Gratuito'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie sua assinatura</p>
            </div>
            <button
              disabled
              title="Em breve"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-sm font-medium rounded-xl cursor-not-allowed"
            >
              Em breve
            </button>
          </div>
        </div>
      </div>

      {/* Equipe */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Equipe</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center text-violet-600 dark:text-violet-400 font-semibold text-sm">
                {(user?.email ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.email}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{userRecord?.role ?? 'Proprietário'}</p>
              </div>
            </div>
            <span className="text-xs bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 px-2 py-1 rounded-full font-medium">Você</span>
          </div>
          <button
            disabled
            title="Em breve"
            className="w-full py-2.5 border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-400 dark:text-gray-500 rounded-xl cursor-not-allowed"
          >
            + Convidar membro da equipe (em breve)
          </button>
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Segurança</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Alterar senha</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Enviaremos um link de redefinição para seu e-mail</p>
            </div>
            <Link href="/auth/forgot-password" className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium">
              Alterar
            </Link>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-50 dark:border-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Autenticação em dois fatores</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Proteção extra para sua conta</p>
            </div>
            <button disabled title="Em breve" className="text-sm text-gray-400 dark:text-gray-500 font-medium cursor-not-allowed">
              Em breve
            </button>
          </div>
        </div>
      </div>

      {/* Notificações */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Notificações</h2>
          </div>
          <span className="text-xs bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">Em breve</span>
        </div>
        <div className="p-6 space-y-3 opacity-60">
          {[
            { label: 'Novo upload recebido', desc: 'Quando um convidado enviar fotos ou vídeos' },
            { label: 'Evento próximo', desc: 'Lembrete 24h antes do evento' },
            { label: 'Espaço de armazenamento', desc: 'Quando atingir 80% do limite' },
            { label: 'Presente comprado', desc: 'Quando alguém adquirir um presente' },
          ].map(({ label, desc }) => (
            <label key={label} className="flex items-center justify-between py-2 cursor-not-allowed">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
              </div>
              <div className="relative">
                <input type="checkbox" defaultChecked disabled className="peer sr-only" />
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 peer-checked:bg-gray-300 dark:peer-checked:bg-gray-600 rounded-full transition" />
                <div className="absolute top-1 left-1 w-4 h-4 bg-white dark:bg-gray-300 rounded-full peer-checked:translate-x-4 transition transform" />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
