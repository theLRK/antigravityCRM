import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createTransport } from 'nodemailer';


// POST /api/leads/:leadId/send-email — manual email from lead profile
export async function POST(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
    try {
        const { leadId } = await params;
        const cookieStore = req.cookies;
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { subject, body, templateUsed } = await req.json();
        if (!subject || !body) return NextResponse.json({ error: 'Subject and body required' }, { status: 400 });

        const [lead, profile] = await Promise.all([
            prisma.lead.findUnique({ where: { id: leadId } }),
            prisma.agentProfile.findUnique({ where: { agentId: user.id } })
        ]);

        if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

        // Replace template variables
        const resolvedBody = body
            .replace(/{{first_name}}/g, lead.firstName)
            .replace(/{{last_name}}/g, lead.lastName)
            .replace(/{{agent_name}}/g, profile?.name || user.email || 'Your Agent')
            .replace(/{{agent_phone}}/g, profile?.phone || '')
            .replace(/{{agent_company}}/g, profile?.company || '')
            .replace(/{{budget_range}}/g, lead.budgetMax ? `$${lead.budgetMax.toLocaleString()}` : 'your budget')
            .replace(/{{preferred_area}}/g, lead.preferredAreas || 'your preferred area');

        const resolvedSubject = subject
            .replace(/{{first_name}}/g, lead.firstName)
            .replace(/{{agent_name}}/g, profile?.name || 'Your Agent');

        // Send via agent's Gmail app password or fall back to env
        const gmailUser = profile?.gmailEmailAddress || process.env.GMAIL_USER;
        const gmailPass = (profile as any)?.gmailAppPassword || process.env.GMAIL_APP_PASSWORD;

        if (gmailUser && gmailPass) {
            const transporter = createTransport({
                service: 'gmail',
                auth: { user: gmailUser, pass: gmailPass }
            });

            await transporter.sendMail({
                from: `"${profile?.emailFromName || profile?.name || 'Formative CRM'}" <${gmailUser}>`,
                to: lead.email,
                subject: resolvedSubject,
                text: resolvedBody
            });
        }

        // Save to email_log
        await (prisma as any).emailLog.create({
            data: {
                leadId,
                recipientEmail: lead.email,
                templateId: templateUsed || 'manual',
                subjectLine: resolvedSubject,
                bodyTextPreview: resolvedBody.substring(0, 200),
                bodyFull: resolvedBody,
                isManual: true,
                templateUsed: templateUsed || 'custom',
                status: 'sent'
            }
        });

        // Log in activity feed
        await prisma.activityLog.create({
            data: {
                leadId,
                eventType: 'EMAIL_SENT_MANUAL',
                actor: user.email || 'agent',
                metadata: resolvedSubject
            }
        });

        // Auto-create follow-up task
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + 3);
        await (prisma as any).task.create({
            data: {
                leadId,
                agentId: user.id,
                title: `Follow up with ${lead.firstName}`,
                taskType: 'Follow up',
                dueDate: followUpDate,
                autoCreated: true,
                notes: `Auto-created after manual email: "${resolvedSubject}"`
            }
        });

        // Update lastContactedAt
        await prisma.lead.update({
            where: { id: leadId },
            data: { lastContactedAt: new Date() }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('[send-email]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

