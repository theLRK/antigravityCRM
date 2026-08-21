'use server';

import { createClient } from '@/utils/supabase/server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
async function getAuthAgentId() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized Access");
    return user.id;
}

// 1. Fetch the Agent's Active Form (MVP assumes 1 active form per agent for now)
export async function getAgentForm(agentIdOverride?: string) {
    const agentId = agentIdOverride || (await getAuthAgentId());

    let form = await prisma.leadCaptureForm.findFirst({
        where: { agentId },
        include: {
            leads: { select: { id: true } } // Fetch only IDs for submission count
        }
    });

    // If no form exists for this new agent, create a default one
    if (!form) {
        form = await prisma.leadCaptureForm.create({
            data: {
                agentId,
                title: "Real Estate Inquiry",
                description: "Let's find your dream home. Please fill out the details below.",
                welcomeMessage: "Welcome! Tell me what you're looking for.",
                successMessage: "Thank you! I have received your inquiry and will be in touch shortly.",
                isActive: true,
                autoSendFirstMessage: true,
                currencySymbol: '₦',
                customFields: JSON.stringify([]) // Empty array of custom fields by default
            },
            include: {
                leads: true
            }
        });
    }

    return form;
}

// 2. Update Form Core Settings
export async function updateFormSettings(formData: FormData) {
    const agentId = await getAuthAgentId();

    const formId = formData.get('formId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const welcomeMessage = formData.get('welcomeMessage') as string;
    const successMessage = formData.get('successMessage') as string;
    const currencySymbol = formData.get('currencySymbol') as string || '$';
    const isActive = formData.get('isActive') === 'on';
    const autoSendFirstMessage = formData.get('autoSendFirstMessage') === 'on';

    if (!formId) throw new Error("Missing form ID");

    await prisma.leadCaptureForm.update({
        where: { id: formId, agentId }, // Ensure they only edit their own form
        data: {
            title,
            description,
            welcomeMessage,
            successMessage,
            currencySymbol,
            isActive,
            autoSendFirstMessage
        }
    });

    revalidatePath('/lead-capture');
    return { success: true };
}

// 3. Save Custom Fields JSON Array
export async function updateCustomFields(formId: string, customFieldsJson: string) {
    const agentId = await getAuthAgentId();

    await prisma.leadCaptureForm.update({
        where: { id: formId, agentId },
        data: {
            customFields: customFieldsJson
        }
    });

    revalidatePath('/lead-capture');
    return { success: true };
}


