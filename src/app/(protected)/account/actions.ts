'use server';

import { createClient } from '@/utils/supabase/server';

import { revalidatePath } from 'next/cache';

export async function updateAccountProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    
    // Agent Profile specific fields
    const phone = formData.get('phone') as string;
    const company = formData.get('company') as string;
    const signature = formData.get('signature') as string;

    // Update Auth user metadata
    await supabase.auth.updateUser({
        data: {
            first_name: firstName,
            last_name: lastName
        }
    });

    const fullName = `${firstName} ${lastName}`.trim();

    // Update Prisma Agent Profile
    await prisma.agentProfile.upsert({
        where: { agentId: user.id },
        update: {
            phone: phone || null,
            company: company || null,
            signature: signature || null,
            name: fullName || null
        },
        create: {
            agentId: user.id,
            phone: phone || null,
            company: company || null,
            signature: signature || null,
            name: fullName || null,
            emailTone: 'Warm & Trust'
        }
    });

    revalidatePath('/account');
}


