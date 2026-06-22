'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register, type AuthFormState } from '@/app/auth/actions'

const initialState: AuthFormState = { error: null }

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Celebration Memory</h1>
          <p className="text-purple-200 mt-2">Crie sua conta e comece a gerenciar eventos</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Criar conta</h2>

          {state.success ? (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-3 text-green-200 text-sm">
              {state.success}
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Seu nome</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Nome da agência</label>
                <input
                  type="text"
                  name="accountName"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                  placeholder="Nome da sua agência ou empresa"
                />
              </div>

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
                <label className="block text-sm font-medium text-purple-200 mb-1">Senha</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Confirmar senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>

              {state.error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm">
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full py-3 px-4 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                {pending ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-purple-200 mt-6">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-white font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
