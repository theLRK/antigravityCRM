import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zcuqpkitrlisalaocykd.supabase.co').replace(/['"]/g, '').trim()
    const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdXFwa2l0cmxpc2FsYW9jeWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzg5MTMsImV4cCI6MjA4Nzg1NDkxM30.HZmAm4hfxCo3iqYGAht2dI8qRVFhpqglRsVnM92TlqU').replace(/['"]/g, '').trim()

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
