import { prisma } from '@/lib/prisma';

export type NotificationType = 'new_lead' | 'lead_reply' | 'follow_up_overdue' | 'high_intent';

export async function createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    leadId?: string
) {
    try {
        await prisma.notification.create({
            data: { userId, type, message, leadId: leadId || null }
        });
    } catch (e) {
        console.warn('[Notifications] Failed to create notification:', e);
    }
}

export async function notifyNewLead(userId: string, leadName: string, score: number, leadId: string) {
    const type: NotificationType = score >= 80 ? 'high_intent' : 'new_lead';
    const message = score >= 80
        ? `🔥 HOT Lead: ${leadName} scored ${score} — Contact immediately!`
        : `New lead captured: ${leadName} (Score: ${score})`;
    return createNotification(userId, type, message, leadId);
}

export async function notifyLeadReply(userId: string, leadName: string, leadId: string) {
    return createNotification(userId, 'lead_reply', `📬 ${leadName} replied to your email!`, leadId);
}

export async function notifyFollowUpOverdue(userId: string, leadName: string, leadId: string) {
    return createNotification(userId, 'follow_up_overdue', `⏰ Follow-up overdue for ${leadName}`, leadId);
}


