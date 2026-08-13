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

    const agentName = profile?.name || profile?.emailFromName || 'Your Agent';
    const agentPhone = profile?.phone || '';
    const agentCompany = profile?.company || '';
    const agentSignature = profile?.signature || agentName;

    const resolvedSubject = subject
        .replace(/\{\{lead_name\}\}/g, `${lead.firstName} ${lead.lastName}`.trim())
        .replace(/\{\{first_name\}\}/g, lead.firstName)
        .replace(/\{\{agent_name\}\}/g, agentName)
        .replace(/\{\{agent_phone\}\}/g, agentPhone)
        .replace(/\{\{agent_company\}\}/g, agentCompany)
        .replace(/\{\{agent_signature\}\}/g, agentSignature);

    const resolvedBody = body
        .replace(/\{\{lead_name\}\}/g, `${lead.firstName} ${lead.lastName}`.trim())
        .replace(/\{\{first_name\}\}/g, lead.firstName)
        .replace(/\{\{agent_name\}\}/g, agentName)
        .replace(/\{\{agent_phone\}\}/g, agentPhone)
        .replace(/\{\{agent_company\}\}/g, agentCompany)
        .replace(/\{\{agent_signature\}\}/g, agentSignature);

    // 1. Send Actual Email
    const gmailUser = profile?.gmailEmailAddress || process.env.GMAIL_USER;
    const gmailPass = (profile as any)?.gmailAppPassword || process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
        const transporter = createTransport({
            service: 'gmail',
            auth: { user: gmailUser, pass: gmailPass }
        });

        await transporter.sendMail({
            from: `"${profile?.emailFromName || agentName}" <${gmailUser}>`,
            to: lead.email,
            subject: resolvedSubject,
            html: resolvedBody.replace(/\n/g, '<br/>')
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

