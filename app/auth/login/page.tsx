'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login, resendConfirmation, type AuthFormState } from '@/app/auth/actions'

const initialState: AuthFormState = { error: null }

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)
  const [resendState, resendAction, resendPending] = useActionState(resendConfirmation, initialState)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Celebration Memory</h1>
          <p className="text-purple-200 mt-2">Gestão de eventos e memórias</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Entrar na plataforma</h2>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">E-mail</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-purple-200">Senha</label>
                <Link href="/auth/forgot-password" className="text-xs text-purple-300 hover:text-white transition">
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {state.error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm space-y-2">
                <p>{state.error}</p>
                {state.unconfirmedEmail && (
                  resendState.success ? (
                    <p className="text-green-200">{resendState.success}</p>
                  ) : (
                    <form action={resendAction}>
                      <input type="hidden" name="email" value={state.unconfirmedEmail} />
                      <button
                        type="submit"
                        disabled={resendPending}
                        className="text-white font-medium underline disabled:opacity-50"
                      >
                        {resendPending ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
                      </button>
                    </form>
                  )
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 px-4 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              {pending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-purple-200 mt-6">
            Não tem uma conta?{' '}
            <Link href="/auth/register" className="text-white font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
