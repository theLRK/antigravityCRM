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
        redirect(`/sign-in?error=${encodeURIComponent('Could not authenticate user')}`)
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
        redirect(`/sign-up?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
