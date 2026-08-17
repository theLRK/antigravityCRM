import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('[Middleware] Supabase environment variables unconfigured in Edge Function. Skipping edge session update.')
            return supabaseResponse
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                            supabaseResponse = NextResponse.next({
                                request,
                            })
                            cookiesToSet.forEach(({ name, value, options }) =>
                                supabaseResponse.cookies.set(name, value, options)
                            )
                        } catch (cookieErr) {
                            console.warn('[Middleware] Cookie setting warning:', cookieErr)
                        }
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (
            !user &&
            !request.nextUrl.pathname.startsWith('/sign-in') &&
            !request.nextUrl.pathname.startsWith('/sign-up') &&
            !request.nextUrl.pathname.startsWith('/auth') &&
            !request.nextUrl.pathname.startsWith('/f/') &&
            request.nextUrl.pathname !== '/'
        ) {
            // If the user is unauthenticated and hits a protected route, redirect to Sign In
            const url = request.nextUrl.clone()
            url.pathname = '/sign-in'
            return NextResponse.redirect(url)
        }

        if (
            user &&
            (request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up'))
        ) {
            // If user is already authenticated but tries to go to an auth page, push them to dashboard
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        return supabaseResponse
    } catch (error) {
        console.error('[Middleware] Edge function exception caught safely:', error)
        return supabaseResponse
    }
}
