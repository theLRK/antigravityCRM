import { prisma } from '@/lib/prisma';
import { sendUnifiedEmailCore } from './service';


export async function runScheduledEmailScheduler() {
    console.log('[ScheduledEmailScheduler] Checking for due emails...');
    
    try {
        const now = new Date();
        const dueEmails = await (prisma as any).scheduledEmail.findMany({
            where: {
                status: 'scheduled',
                scheduledAt: { lte: now }
            }
        });

        console.log(`[ScheduledEmailScheduler] Found ${dueEmails.length} emails to send.`);

        for (const email of dueEmails) {
            try {
                // Atomic claim: update status to 'processing' before dispatch to prevent duplicate sends
                const claimed = await (prisma as any).scheduledEmail.updateMany({
                    where: { id: email.id, status: 'scheduled' },
                    data: { status: 'processing' }
                });

                if (claimed.count === 0) {
                    console.log(`[ScheduledEmailScheduler] Skipping email ${email.id}: already claimed.`);
                    continue;
                }

                console.log(`[ScheduledEmailScheduler] Sending scheduled email ${email.id} to Lead ${email.leadId}...`);
                
                await sendUnifiedEmailCore({
                    leadId: email.leadId,
                    agentId: email.agentId,
                    subject: email.subject,
                    body: email.body,
                    templateId: 'scheduled_manual',
                    isManual: true
                });

                await (prisma as any).scheduledEmail.update({
                    where: { id: email.id },
                    data: { status: 'sent' }
                });
                
                console.log(`[ScheduledEmailScheduler] ✅ Email ${email.id} sent and status updated.`);
            } catch (err: any) {
                console.error(`[ScheduledEmailScheduler] ❌ Failed to send email ${email.id}:`, err.message);
                await (prisma as any).scheduledEmail.updateMany({
                    where: { id: email.id, status: 'processing' },
                    data: { status: 'failed' }
                });
            }
        }

        return { success: true, processed: dueEmails.length };
    } catch (e: any) {
        console.error('[ScheduledEmailScheduler] Critical failure:', e.message);
        throw e;
    }
}

