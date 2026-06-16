import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Check routes
  if (path.startsWith('/agency') || path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Fetch profile role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('Middleware profile fetch failed. Error:', profileError?.message, 'Code:', profileError?.code, 'User ID:', user.id)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protect /agency
    if (path.startsWith('/agency')) {
      if (profile.role !== 'agency') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Fetch agency status
      const { data: agency } = await supabase
        .from('agencies')
        .select('status')
        .eq('id', user.id)
        .single()

      // If agency does not have an entry, it might be in registration process
      // Let's redirect to profile setup if not found, or let them setup.
      // But if agency exists and status is not approved, restrict access except /agency/status or /agency/profile
      if (agency && agency.status !== 'approved' && !path.startsWith('/agency/status')) {
        return NextResponse.redirect(new URL('/agency/status', request.url))
      }
    }

    // Protect /admin
    if (path.startsWith('/admin')) {
      if (profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/logos/assets (static images)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
