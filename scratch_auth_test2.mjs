import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'c:/Users/PC/Documents/AGAINN/formative/frontend/.env' })

const url = 'https://zcuqpkitrlisalaocykd.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdXFwa2l0cmxpc2FsYW9jeWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzg5MTMsImV4cCI6MjA4Nzg1NDkxM30.HZmAm4hfxCo3iqYGAht2dI8qRVFhpqglRsVnM92TlqU'

const supabase = createClient(url, key)

async function testOAuth() {
  console.log('--- Testing OAuth URL generation for my-formative-crm.vercel.app ---')
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://my-formative-crm.vercel.app/auth/callback'
    }
  })
  if (error) console.error('OAuth Error:', error)
  else console.log('OAuth URL:', data.url)
}

async function testPasswordLogin() {
  console.log('--- Testing Email/Password SignIn for dummy test ---')
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'WrongPassword123!'
  })
  if (error) {
    console.log('Expected error on wrong password:', error.message, '| Status:', error.status)
  } else {
    console.log('Success:', data)
  }
}

async function run() {
  await testOAuth()
  await testPasswordLogin()
}

run()
