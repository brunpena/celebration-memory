import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Valida o token com o servidor Supabase (mais seguro que getSession)
  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginOrRegisterPage =
    request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/register'

  if (!user && isAdminRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (user && isLoginOrRegisterPage) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Roda em todas as rotas exceto arquivos estáticos e páginas públicas de eventos
    '/((?!_next/static|_next/image|favicon.ico|e/).*)',
  ],
}
