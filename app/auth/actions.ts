'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AuthFormState = {
  error: string | null
  success?: string | null
  unconfirmedEmail?: string
}

export async function login(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.code === 'email_not_confirmed') {
      return {
        error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada (e o spam).',
        unconfirmedEmail: email,
      }
    }
    return { error: 'E-mail ou senha inválidos.' }
  }

  const ensureError = await ensureAccountForUser(data.user.id)
  if (ensureError) {
    return { error: ensureError }
  }

  redirect('/admin/dashboard')
}

export async function register(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get('name') ?? '').trim()
  const accountName = String(formData.get('accountName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, account_name: accountName } },
  })

  if (error) {
    return { error: error.code === 'user_already_exists' ? 'Este e-mail já está cadastrado.' : 'Não foi possível criar a conta.' }
  }

  // Sem sessão ainda (confirmação de e-mail pendente) — conta/usuário serão
  // criados no primeiro login, em ensureAccountForUser().
  if (!data.session) {
    return {
      error: null,
      success: 'Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.',
    }
  }

  const ensureError = await ensureAccountForUser(data.user!.id)
  if (ensureError) {
    return { error: ensureError }
  }

  redirect('/admin/dashboard')
}

async function ensureAccountForUser(userId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, account_id')
    .eq('id', userId)
    .maybeSingle()

  if (existingUser?.account_id) {
    return null
  }

  const { data: { user } } = await supabase.auth.getUser()
  const name = (user?.user_metadata?.name as string | undefined) || user?.email || 'Usuário'
  const accountName = (user?.user_metadata?.account_name as string | undefined) || `Conta de ${name}`

  const { error: bootstrapError } = await supabase.rpc('bootstrap_account', {
    p_name: name,
    p_account_name: accountName,
  })

  if (bootstrapError) {
    return 'Não foi possível configurar sua agência. Tente novamente em alguns instantes.'
  }

  return null
}

export async function forgotPassword(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    return { error: 'Não foi possível enviar o e-mail de recuperação.' }
  }

  return { error: null, success: 'Se o e-mail existir em nossa base, você receberá um link para redefinir a senha.' }
}

export async function resetPassword(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Não foi possível redefinir a senha. Solicite um novo link.' }
  }

  redirect('/admin/dashboard')
}

export async function resendConfirmation(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim()

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })

  if (error) {
    return { error: 'Não foi possível reenviar o e-mail de confirmação.' }
  }

  return { error: null, success: 'E-mail de confirmação reenviado. Verifique sua caixa de entrada (e o spam).' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
