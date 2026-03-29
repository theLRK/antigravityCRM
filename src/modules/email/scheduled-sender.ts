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
            }
        }

        return { success: true, processed: dueEmails.length };
    } catch (e: any) {
        console.error('[ScheduledEmailScheduler] Critical failure:', e.message);
        throw e;
    }
}

