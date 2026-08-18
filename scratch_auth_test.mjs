import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'c:/Users/PC/Documents/AGAINN/formative/frontend/.env' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase Client initialization...')
console.log('URL:', url)
console.log('Key prefix:', key ? key.substring(0, 20) + '...' : 'MISSING')

const supabase = createClient(url, key)

async function test() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://formative-crm.vercel.app/auth/callback',
      }
    })
    
    if (error) {
      console.error('OAuth Error:', error)
    } else {
      console.log('OAuth URL generated successfully:', data.url)
    }
  } catch (err) {
    console.error('Caught error:', err)
  }
}

test()
