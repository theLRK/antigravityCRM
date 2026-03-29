'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { resend } from '@/utils/resend';

export async function getAgentProfile() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const profile = await prisma.agentProfile.findUnique({
        where: { agentId: user.id }
    });

    // If no profile exists, create a default one
    if (!profile) {
        return await prisma.agentProfile.create({
            data: {
                agentId: user.id,
                emailTone: 'Warm & Trust',
                emailTemplateHotSubject: 'Let’s schedule your showing today, {{first_name}}!',
                emailTemplateHotBody: 'Hey {{first_name}},\n\nI saw you’re ready to move soon in the {{preferred_area}} area with a {{budget_range}} budget. That’s great! I specialize in helping buyers on similar timelines and would love to schedule a showing with you as soon as possible.\n\nWhen is a good time today or tomorrow for a quick call?\n\nBest,\n{{agent_name}}\n{{agent_phone}}',
                emailTemplateWarmSubject: 'Great options for your next step',
                emailTemplateWarmBody: 'Hi {{first_name}},\n\nThanks for sharing your goals. I’d love to help you explore options in your timeline and budget. Many buyers find it helpful to talk through priorities and available listings.\n\nWhat matters most to you when viewing homes?\n\nLooking forward to your reply,\n{{agent_name}}\n{{agent_phone}}',
                emailTemplateColdSubject: 'Helpful resources for your home search',
                emailTemplateColdBody: 'Hello {{first_name}},\n\nThanks for your interest in finding a home. I put together a quick guide on things to consider when planning your move.\n\nFeel free to ask any questions you have — I’m here to help when you’re ready.\n\nAll the best,\n{{agent_name}}\n{{agent_phone}}',
            }
        });
    }
    return profile;
}

export async function updateEmailSettings(formData: FormData) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const emailFromName = formData.get('emailFromName') as string;
    const emailTone = formData.get('emailTone') as string;

    await prisma.agentProfile.update({
        where: { agentId: user.id },
        data: { emailFromName, emailTone }
    });

    revalidatePath('/engage');
}

export async function updateEmailTemplate(tier: 'hot' | 'warm' | 'cold', subject: string, body: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const dataPayload: any = {};
    if (tier === 'hot') {
        dataPayload.emailTemplateHotSubject = subject;
        dataPayload.emailTemplateHotBody = body;
    } else if (tier === 'warm') {
        dataPayload.emailTemplateWarmSubject = subject;
        dataPayload.emailTemplateWarmBody = body;
    } else if (tier === 'cold') {
        dataPayload.emailTemplateColdSubject = subject;
        dataPayload.emailTemplateColdBody = body;
    }

    await prisma.agentProfile.update({
        where: { agentId: user.id },
        data: dataPayload
    });

    revalidatePath('/engage');
}

export async function sendTestEmailAction(tier: 'hot' | 'warm' | 'cold', leadId?: string) {
    if (leadId) {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (lead) {
            // Send Actual Email
            try {
                await resend.emails.send({
                    from: 'Formative CRM <onboarding@resend.dev>',
                    to: [lead.email],
                    subject: `Follow-up: New Property Update`,
                    html: `<p>Hi ${lead.firstName}, we have some new updates regarding properties in your area. Let us know when you'd like to chat!</p>`
                });
            } catch (err) {
                console.error("Resend delivery failed:", err);
            }

            await prisma.emailLog.create({
                data: {
                    leadId,
                    recipientEmail: lead.email,
                    templateId: `manual_${tier}`,
                    subjectLine: `Property Follow-up`,
                    bodyTextPreview: `Checking in about your property search...`,
                    status: 'sent',
                    isManual: true,
                    templateUsed: `Tier ${tier} Template`
                }
            });
            
            await prisma.activityLog.create({
                data: {
                    leadId,
                    eventType: 'property_pitched',
                    actor: 'agent',
                    metadata: JSON.stringify({ tier })
                }
            });

            // 4. Automatically Create Follow Up Task
            const followUpDate = new Date();
            followUpDate.setDate(followUpDate.getDate() + 2);
            await prisma.task.create({
                data: {
                    leadId,
                    agentId: lead.assignedAgentId || 'system',
                    title: `Follow up with ${lead.firstName} about property updates`,
                    taskType: 'Follow up',
                    dueDate: followUpDate,
                    status: 'pending',
                    notes: `Automated task created after sending property follow-up (Send Now).`,
                    autoCreated: true
                }
            });

            await prisma.lead.update({
                where: { id: leadId },
                data: { lastContactedAt: new Date() }
            });
        }
    }
    revalidatePath('/engage');
    return { success: true };
}

import { sendUnifiedEmail } from '@/lib/email-utils';

export async function sendManualEmailAction(leadId: string, subject: string, body: string, propertyId?: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await sendUnifiedEmail({
        leadId,
        agentId: user.id,
        subject,
        body,
        templateId: 'manual_custom',
        isManual: true
    });

    revalidatePath('/engage');
    return { success: true };
}

export async function markTaskComplete(taskId: string) {
    const task = await prisma.task.update({
        where: { id: taskId },
        data: { status: 'completed' }
    });

    if (task.leadId) {
        await prisma.activityLog.create({
            data: {
                leadId: task.leadId,
                eventType: 'task_completed',
                actor: 'agent',
                metadata: JSON.stringify({ taskTitle: task.title })
            }
        });
    }

    revalidatePath('/engage');
    return { success: true };
}

export async function markTaskDoneAction(taskId: string) {
    const task = await prisma.task.update({
        where: { id: taskId },
        data: { status: 'completed' }
    });

    if (task.leadId) {
        await prisma.activityLog.create({
            data: {
                leadId: task.leadId,
                eventType: 'task_completed',
                actor: 'agent',
                metadata: JSON.stringify({ taskTitle: task.title })
            }
        });
    }

    revalidatePath('/engage');
    return { success: true };
}

export async function rescheduleTaskAction(taskId: string, newDate: Date) {
    await prisma.task.update({
        where: { id: taskId },
        data: { dueDate: newDate, status: 'pending' }
    });
    revalidatePath('/engage');
    return { success: true };
}

export async function createTaskAction(data: { leadId: string; propertyId?: string; title: string; note?: string; dueDate?: Date; taskType?: string }) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    await prisma.task.create({
        data: {
            leadId: data.leadId,
            agentId: user.id,
            title: data.title,
            taskType: data.taskType || 'Manual Task',
            dueDate: data.dueDate || new Date(Date.now() + 86400000), // Default to tomorrow
            notes: data.note || 'Manually created task.'
        }
    });

    revalidatePath('/engage');
    revalidatePath('/properties');
    return { success: true };
}

export async function scheduleManualEmailAction(leadId: string, subject: string, body: string, scheduledAt: string) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.scheduledEmail.create({
        data: {
            leadId,
            agentId: user.id,
            subject,
            body,
            scheduledAt: new Date(scheduledAt),
            status: 'scheduled'
        }
    });

    revalidatePath('/engage');
    return { success: true };
}

export async function getScheduledEmailsAction() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    return await prisma.scheduledEmail.findMany({
        where: { agentId: user.id, status: 'scheduled' },
        include: { lead: true },
        orderBy: { scheduledAt: 'asc' }
    });
}

