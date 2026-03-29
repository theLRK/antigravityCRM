import { prisma } from '@/lib/prisma';
import { createTransport } from 'nodemailer';


interface SendEmailParams {
    leadId: string;
    agentId: string;
    subject: string;
    body: string;
    templateId?: string;
    isManual?: boolean;
}

export async function sendUnifiedEmailCore({
    leadId,
    agentId,
    subject,
    body,
    templateId = 'manual',
    isManual = true
}: SendEmailParams) {
    const [lead, profile] = await Promise.all([
        prisma.lead.findUnique({ where: { id: leadId } }),
        prisma.agentProfile.findUnique({ where: { agentId } })
    ]);

    if (!lead) throw new Error('Lead not found');

    // 1. Send Actual Email
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
            subject,
            html: body.replace(/\n/g, '<br/>')
        });
    }

    // 2. Save to EmailLog
    await (prisma as any).emailLog.create({
        data: {
            leadId,
            recipientEmail: lead.email,
            templateId,
            subjectLine: subject,
            bodyTextPreview: body.substring(0, 200),
            bodyFull: body,
            isManual,
            status: 'sent',
            templateUsed: templateId
        }
    });

    // 3. Log Activity
    await prisma.activityLog.create({
        data: {
            leadId,
            eventType: isManual ? 'EMAIL_SENT_MANUAL' : 'EMAIL_SENT_AUTO',
            actor: profile?.name || 'System',
            metadata: JSON.stringify({ subject })
        }
    });

    // 4. Update Lead Last Contacted
    await prisma.lead.update({
        where: { id: leadId },
        data: { lastContactedAt: new Date() }
    });

    // 5. Create Follow Up Task (+3 days)
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 3);
    await (prisma as any).task.create({
        data: {
            leadId,
            agentId,
            title: `Follow up with ${lead.firstName}`,
            taskType: 'Follow up',
            dueDate: followUpDate,
            status: 'pending',
            autoCreated: true,
            notes: `Auto-created after email: "${subject}"`
        }
    });

    return { success: true };
}

