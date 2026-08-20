import { prisma } from '@/lib/prisma';
import { createTransport } from 'nodemailer';
import { resend } from '@/utils/resend';

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
    if (lead.assignedAgentId !== agentId) {
        throw new Error('Unauthorized lead email access');
    }

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

    // 1. Send Actual Email (dual-provider with graceful error fallback)
    let emailSentSuccessfully = false;
    let deliveryNotice = '';
    let resendMessageId: string | undefined = undefined;

    // Fail closed: Require agent's personal credentials; do NOT fall back to global process.env.GMAIL_USER
    const gmailUser = profile?.gmailEmailAddress;
    const gmailPass = (profile as any)?.gmailAppPassword;

    if (gmailUser && gmailPass) {
        try {
            const transporter = createTransport({
                service: 'gmail',
                auth: { user: gmailUser, pass: gmailPass }
            });

            const sendInfo = await transporter.sendMail({
                from: `"${profile?.emailFromName || agentName}" <${gmailUser}>`,
                to: lead.email,
                subject: resolvedSubject,
                html: resolvedBody.replace(/\n/g, '<br/>')
            });
            emailSentSuccessfully = true;
            resendMessageId = sendInfo.messageId;
        } catch (smtpErr: any) {
            console.warn('[Email Engine] Gmail SMTP delivery notice:', smtpErr?.message || smtpErr);
            deliveryNotice = smtpErr?.message || 'SMTP delivery warning';
        }
    }

    if (!emailSentSuccessfully && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_dummy_fallback_for_build') {
        try {
            const resendRes = await resend.emails.send({
                from: 'Formative CRM <onboarding@resend.dev>',
                to: [lead.email],
                subject: resolvedSubject,
                html: resolvedBody.replace(/\n/g, '<br/>')
            });
            if (resendRes.error) {
                console.warn('[Email Engine] Resend delivery notice:', resendRes.error);
                deliveryNotice = resendRes.error.message;
            } else {
                emailSentSuccessfully = true;
                if (resendRes.data?.id) {
                    resendMessageId = resendRes.data.id;
                }
            }
        } catch (resendErr: any) {
            console.warn('[Email Engine] Resend API notice:', resendErr?.message || resendErr);
            deliveryNotice = resendErr?.message || 'Resend API notice';
        }
    }

    // 2. Save to EmailLog (Always record attempt with stored Resend/SMTP message ID)
    await (prisma as any).emailLog.create({
        data: {
            leadId,
            recipientEmail: lead.email,
            templateId,
            subjectLine: resolvedSubject,
            bodyTextPreview: resolvedBody.substring(0, 200),
            bodyFull: resolvedBody,
            isManual,
            status: emailSentSuccessfully ? 'sent' : 'logged',
            templateUsed: templateId,
            lastError: deliveryNotice || undefined,
            gmailMessageId: resendMessageId || undefined
        }
    });

    // 3. Log Activity
    await prisma.activityLog.create({
        data: {
            leadId,
            eventType: isManual ? 'EMAIL_SENT_MANUAL' : 'EMAIL_SENT_AUTO',
            actor: profile?.name || 'System',
            metadata: JSON.stringify({ subject: resolvedSubject, status: emailSentSuccessfully ? 'sent' : 'logged' })
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
            notes: `Auto-created after email: "${resolvedSubject}"`
        }
    });

    return { success: true, emailSent: emailSentSuccessfully, notice: deliveryNotice };
}

