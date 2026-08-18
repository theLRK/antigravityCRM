import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zcuqpkitrlisalaocykd.supabase.co').replace(/['"]/g, '').trim()
    const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdXFwa2l0cmxpc2FsYW9jeWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzg5MTMsImV4cCI6MjA4Nzg1NDkxM30.HZmAm4hfxCo3iqYGAht2dI8qRVFhpqglRsVnM92TlqU').replace(/['"]/g, '').trim()

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
