import nodemailer from "nodemailer";
import { prisma } from '@/lib/prisma';
import { refineEmailContent } from './ai-writer';


// Build a nodemailer transporter from agent credentials stored in the DB.
// Falls back to .env values if DB credentials are not available.
async function buildTransporter(agentId?: string) {
    let gmailUser: string | undefined;
    let gmailAppPassword: string | undefined;
    let fromName: string | undefined;
    let replyToEmail: string | undefined;
    let isCustomInbox = false;

    // 1. Try to load personal credentials from AgentProfile
    if (agentId) {
        const profile = await prisma.agentProfile.findUnique({
            where: { agentId }
        });

        const agentUser = await prisma.agentUser.findFirst({
            where: { supabaseId: agentId }
        });

        if (profile?.name) {
            fromName = profile.company ? `${profile.name} — ${profile.company}` : profile.name;
        } else if (profile?.emailFromName) {
            fromName = profile.emailFromName;
        }

        replyToEmail = profile?.gmailEmailAddress || agentUser?.email || undefined;

        if (profile?.gmailEmailAddress && profile?.gmailAppPassword) {
            gmailUser = profile.gmailEmailAddress;
            gmailAppPassword = profile.gmailAppPassword;
            isCustomInbox = true;
            console.log(`[EmailService] Using personal Gmail for agent ${agentId}: ${gmailUser} (${fromName})`);
        }
    }

    // Fail closed: Never fall back to system or global environment variable credentials.
    if (!gmailUser || !gmailAppPassword) {
        console.warn(`[EmailService] Fail Closed: No personal Gmail credentials configured for agent ${agentId || 'unknown'}. Skipping send.`);
        return null;
    }

    const fromHeader = isCustomInbox
        ? (fromName ? `"${fromName}" <${gmailUser}>` : `"Formative Real Estate" <${gmailUser}>`)
        : (fromName ? `"${fromName} (via Formative)" <${gmailUser}>` : `"Formative Real Estate" <${gmailUser}>`);

    return {
        transporter: nodemailer.createTransport({
            service: "gmail",
            auth: { user: gmailUser, pass: gmailAppPassword }
        }),
        from: fromHeader,
        replyTo: replyToEmail || gmailUser,
        senderEmail: gmailUser,
        isCustomInbox
    };
}

export async function sendLeadEmail(
    to: string,
    subject: string,
    html: string,
    agentId?: string
): Promise<boolean> {
    const transport = await buildTransporter(agentId);

    if (!transport) {
        console.warn(`[EmailService] No Gmail credentials found (personal or system). Skipping email to ${to}.`);
        return false;
    }

    try {
        console.log(`[EmailService] Sending automated email to ${to} from ${transport.from} (Reply-To: ${transport.replyTo})...`);
        const info = await transport.transporter.sendMail({
            from: transport.from,
            replyTo: transport.replyTo,
            to,
            subject,
            html
        });
        console.log(`[EmailService] ✅ Email dispatched successfully: ${info.messageId}`);
        return true;
    } catch (error: any) {
        console.error(`[EmailService] ❌ Email sending failed:`, error.message || error);
        return false;
    }
}

export async function dispatchWelcomeEmail(leadId: string, scheduledDelay: boolean = false): Promise<void> {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                sourceForm: true,
                scores: { take: 1, orderBy: { createdAt: 'desc' } }
            }
        });

        if (!lead || lead.isUnsubscribed) {
            console.log(`[EmailService] Skipping email: lead not found or unsubscribed.`);
            return;
        }

        if (lead.sourceForm && !lead.sourceForm.autoSendFirstMessage) {
            console.log(`[EmailService] Auto-Send First Message is disabled for this form. Skipping email dispatch.`);
            return;
        }

        const scoreObj = lead.scores[0];
        if (!scoreObj) {
            console.log(`[EmailService] Lead ${lead.id} has no score yet. Aborting email.`);
            return;
        }

        const score = scoreObj.finalScore;
        const tier = score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold';

        // Cold leads: 10-minute delay
        if (tier === 'cold' && !scheduledDelay) {
            console.log(`[EmailService] Lead is COLD (score: ${score}). Delaying email by 10 minutes...`);
            setTimeout(() => {
                dispatchWelcomeEmail(leadId, true).catch(console.error);
            }, 10 * 60 * 1000);
            return;
        }

        // Look up agent credentials — prioritize lead owner, fallback to form's agentId
        const agentId = lead.assignedAgentId ?? lead.sourceForm?.agentId ?? undefined;

        // Load agent profile for template overrides
        const agentProfile = agentId
            ? await prisma.agentProfile.findUnique({ where: { agentId } })
            : null;

        const agentName = agentProfile?.name || agentProfile?.emailFromName || 'Your Real Estate Advisor';

        // Build email from saved templates or use built-in defaults
        let subject = '';
        let body = '';

        const isInvestor = Boolean(lead.motivation?.toLowerCase().includes('invest') || lead.sourceForm?.title?.toLowerCase().includes('invest'));

        const fill = (template: string) =>
            template
                .replace(/\{\{first_name\}\}/g, lead.firstName)
                .replace(/\{\{agent_name\}\}/g, agentName)
                .replace(/\{\{agent_phone\}\}/g, agentProfile?.phone || '')
                .replace(/\{\{agent_company\}\}/g, agentProfile?.company || '')
                .replace(/\{\{agent_signature\}\}/g, agentProfile?.signature || agentName)
                .replace(/\{\{agent_website\}\}/g, agentProfile?.websiteUrl || '')
                .replace(/\{\{timeline\}\}/g, lead.moveTimeline || 'your timeline')
                .replace(/\{\{budget_range\}\}/g, lead.budgetMin && lead.budgetMax
                    ? `${lead.currency || '$'}${lead.budgetMin.toLocaleString()}–${lead.currency || '$'}${lead.budgetMax.toLocaleString()}`
                    : 'your budget range')
                .replace(/\{\{location\}\}/g, lead.preferredAreas || 'your desired area')
                .replace(/\{\{financing_status\}\}/g, lead.preApproval === true ? 'Pre-approved' : lead.preApproval === false ? 'Not pre-approved' : lead.financing?.replace('_', ' ') || 'Not specified')
                .replace(/\{\{intent_snippet\}\}/g, isInvestor 
                    ? "As an investor, focusing on properties with strong cash flow and high ROI potential is key. I've prepared some off-market cap-rate models we can review."
                    : "I'll make sure we find a home in a great community that fits all your lifestyle needs.");

        if (tier === 'hot') {
            subject = fill(agentProfile?.emailTemplateHotSubject || `Let's schedule your home tour, {{first_name}}!`);
            body = fill(agentProfile?.emailTemplateHotBody || `<p>Hi <strong>{{first_name}}</strong>,</p>
<p>I saw that you're planning to move soon and looking in the <strong>{{timeline}}</strong> timeframe. I'd love to help you find a home in <strong>{{location}}</strong> that fits your budget.</p>
<p>{{intent_snippet}}</p>
<p>Would you be open to a quick call today or tomorrow to schedule a showing?</p>
<p>Best,<br/><strong>{{agent_name}}</strong></p>
<hr/><small>To unsubscribe, reply UNSUBSCRIBE.</small>`);
            
            // Refine with LLM before creating draft
            console.log(`[EmailService] Refining HOT email with AI...`);
            const refined = await refineEmailContent(subject, body, lead, agentProfile);
            subject = refined.subject;
            body = refined.body;

        } else if (tier === 'warm') {
            subject = fill(agentProfile?.emailTemplateWarmSubject || `Helping you plan your next move, {{first_name}}`);
            body = fill(agentProfile?.emailTemplateWarmBody || `<p>Hi <strong>{{first_name}}</strong>,</p>
<p>Thanks for sharing your home search details. I'd be happy to help you explore options in <strong>{{location}}</strong> and answer any questions.</p>
<p>{{intent_snippet}}</p>
<p>What are the most important features you're looking for in a property?</p>
<p>Best,<br/><strong>{{agent_name}}</strong></p>
<hr/><small>To unsubscribe, reply UNSUBSCRIBE.</small>`);
        } else {
            subject = fill(agentProfile?.emailTemplateColdSubject || `Helpful resources for your property search, {{first_name}}`);
            body = fill(agentProfile?.emailTemplateColdBody || `<p>Hello <strong>{{first_name}}</strong>,</p>
<p>Thanks for reaching out. Finding the right property in <strong>{{location}}</strong> can take time, and I'm here whenever you're ready.</p>
<p>{{intent_snippet}}</p>
<p>If you'd like, I can send some helpful resources to guide you through the process.</p>
<p>All the best,<br/><strong>{{agent_name}}</strong></p>
<hr/><small>To unsubscribe, reply UNSUBSCRIBE.</small>`);
        }

        console.log(`[EmailService] Auto-dispatching ${tier.toUpperCase()} email to ${lead.email}...`);
        const success = await sendLeadEmail(lead.email, subject, body, agentId);

        // Log to database
        try {
            await prisma.emailLog.create({
                data: {
                    leadId: lead.id,
                    recipientEmail: lead.email,
                    templateId: `engage_${tier}`,
                    subjectLine: subject,
                    status: success ? 'sent' : 'failed',
                    bodyTextPreview: body,
                    attemptCount: 1
                }
            });

            await prisma.activityLog.create({
                data: {
                    leadId: lead.id,
                    eventType: success ? 'email_sent' : 'email_failed',
                    actor: 'system',
                    isError: !success,
                    errorMessage: success ? undefined : 'Email dispatch failed (missing credentials or network error).',
                    metadata: JSON.stringify({ subject, tier })
                }
            });

        } catch (logErr: any) {
            console.warn(`[EmailService] Failed to log email event:`, logErr.message);
        }

    } catch (criticalError: any) {
        console.error(`[EmailService] Critical error during email dispatch:`, criticalError.message || criticalError);
        // Note: we do NOT throw here so that the event bus does not crash.
    }
}

// Test email — sends to the agent's own address to verify credentials work
export async function sendTestEmail(agentId: string): Promise<{ success: boolean; message: string }> {
    const profile = await prisma.agentProfile.findUnique({ where: { agentId } });

    if (!profile?.gmailEmailAddress || !profile?.gmailAppPassword) {
        return { success: false, message: 'No email credentials configured. Please set your Gmail address and App Password in Settings.' };
    }

    const transport = await buildTransporter(agentId);
    if (!transport) {
        return { success: false, message: 'Could not build transporter. Check your credentials.' };
    }

    try {
        await transport.transporter.sendMail({
            from: transport.from,
            to: profile.gmailEmailAddress,
            subject: `[Formative CRM] ✅ Test Email — Your email is connected!`,
            html: `<h2>✅ Your email is working!</h2>
<p>This test email was sent from <strong>Formative CRM</strong> using your configured Gmail account.</p>
<p>Automated lead emails will be sent from: <strong>${profile.gmailEmailAddress}</strong></p>
<p>Sender name: <strong>${profile.emailFromName || 'Formative CRM'}</strong></p>
<p>Sent at: ${new Date().toLocaleString()}</p>`
        });

        console.log(`[EmailService] ✅ Test email sent to ${profile.gmailEmailAddress}`);
        return { success: true, message: `Test email sent to ${profile.gmailEmailAddress}! Check your inbox.` };
    } catch (error: any) {
        return { success: false, message: `Failed: ${error.message}` };
    }
}

// Used specifically by AI sequence executors to dispatch a fully pre-rendered email.
export async function dispatchAIEmail(
    leadId: string,
    templateId: string,
    { subject, body, isDraft }: { subject: string; body: string; isDraft: boolean }
) {
    console.log(`[EmailService] Dispatching AI email for lead ${leadId} (Draft: ${isDraft})`);
    
    const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { sourceForm: true }
    });

    if (!lead) return false;

    const agentId = lead.assignedAgentId ?? lead.sourceForm?.agentId ?? undefined;

    if (isDraft) {
        try {
            await prisma.emailLog.create({
                data: {
                    leadId: lead.id,
                    recipientEmail: lead.email,
                    templateId,
                    subjectLine: subject,
                    bodyTextPreview: body,
                    status: 'draft',
                    attemptCount: 0
                }
            });
            await prisma.activityLog.create({
                data: {
                    leadId: lead.id,
                    eventType: 'email_draft_created',
                    actor: 'ai_sequence',
                    metadata: JSON.stringify({ subject, templateId, message: "Draft pending broker approval" })
                }
            });
            return true;
        } catch (e: any) {
            console.error('[EmailService] Failed to save AI draft', e.message);
            return false;
        }
    }

    // Send it
    const success = await sendLeadEmail(lead.email, subject, body, agentId);

    try {
        await prisma.emailLog.create({
            data: {
                leadId: lead.id,
                recipientEmail: lead.email,
                templateId,
                subjectLine: subject,
                status: success ? 'sent' : 'failed',
                bodyTextPreview: body,
                attemptCount: 1
            }
        });

        await prisma.activityLog.create({
            data: {
                leadId: lead.id,
                eventType: success ? 'email_sent' : 'email_failed',
                actor: 'ai_sequence',
                isError: !success,
                errorMessage: success ? undefined : 'AI sequence email dispatch failed.',
                metadata: JSON.stringify({ subject, templateId })
            }
        });
    } catch (e: any) {
        console.error('[EmailService] Failed to log AI email dispatch', e.message);
    }

    return success;
}

