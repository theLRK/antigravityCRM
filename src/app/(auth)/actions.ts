'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error('[LoginAction] Auth error:', error.message)
        redirect(`/sign-in?error=${encodeURIComponent(error.message || 'Invalid email or password')}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const fullName = formData.get('fullName') as string || '';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Agent';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                agency_name: formData.get('agencyName') as string,
                phone: formData.get('phoneNumber') as string,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        console.error('[SignupAction] Auth error:', error.message)
        let errorMessage = error.message;
        if (error.message.includes('rate limit')) {
            errorMessage = 'Too many sign-up attempts. Please wait a few minutes or contact support.';
        }
        redirect(`/sign-up?error=${encodeURIComponent(errorMessage)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function loginWithGoogle() {
    const supabase = await createClient()
    const { headers } = await import('next/headers')
    
    // In Next 15 headers() returns a Promise
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:4000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const redirectUrl = `${protocol}://${host}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUrl,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        console.error('[GoogleOAuth] error:', error.message)
        redirect('/sign-in?error=' + encodeURIComponent('Could not initialize Google Authentication'))
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function requestPasswordReset(formData: FormData) {
    const supabase = await createClient()
    const email = (formData.get('email') as string || '').trim()

    if (!email) {
        redirect('/forgot-password?error=' + encodeURIComponent('Email address is required'))
    }

    const { headers } = await import('next/headers')
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:4000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const redirectUrl = `${protocol}://${host}/auth/callback?next=/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
    })

    if (error) {
        console.error('[ResetPasswordAction] error:', error.message)
        redirect('/forgot-password?error=' + encodeURIComponent(error.message))
    }

    redirect('/forgot-password?success=true&email=' + encodeURIComponent(email))
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || password.length < 6) {
        redirect('/reset-password?error=' + encodeURIComponent('Password must be at least 6 characters'))
    }

    if (password !== confirmPassword) {
        redirect('/reset-password?error=' + encodeURIComponent('Passwords do not match'))
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    })

    if (error) {
        console.error('[UpdatePasswordAction] error:', error.message)
        redirect('/reset-password?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
