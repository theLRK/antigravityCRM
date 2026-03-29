import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testAuth() {
    console.log('Testing Supabase Connection...')
    console.log(`URL: ${SUPABASE_URL}`)

    try {
        // Create a test user
        const { data, error } = await supabase.auth.signUp({
            email: 'test@formative.io',
            password: 'Password123!',
            options: {
                data: {
                    first_name: 'Test',
                    last_name: 'Agent',
                }
            }
        })

        if (error) {
            console.error('Registration Error:', error.message)
        } else {
            console.log('Successfully registered test user!')
            console.log(data.user?.email)
        }

    } catch (err) {
        console.error('Connection failed.', err)
    }
}

testAuth()
