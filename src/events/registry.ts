import { bus } from './bus';
import { processScoreForLead } from '../modules/scoring/orchestrator';
import { dispatchWelcomeEmail } from '../modules/email/dispatcher';

export const registerEventHandlers = () => {
    // Phase 1 -> Phase 2 connection
    bus.on('lead.created', async (payload) => {
        console.log(`[Event] lead.created -> scoring lead ${payload.leadId}`);
        // Fetch the full lead data before scoring
        import { prisma } from '@/lib/prisma';
        const dbLead = await prisma.lead.findUnique({ where: { id: payload.leadId } });

        if (!dbLead) {
            console.error(`[Event Error] Lead ${payload.leadId} not found for scoring.`);
            return;
        }

        // Run async, do not await so we don't block the event loop/emitter
        processScoreForLead(payload.leadId, dbLead).catch((err: any) => {
            console.error('[Event Error] Failed to score lead:', err);
        });
    });

    // Phase 10 -> Email Automation
    bus.on('lead.scored', (payload) => {
        console.log(`[Event] lead.scored -> dispatching welcome email for lead ${payload.leadId}`);
        dispatchWelcomeEmail(payload.leadId).catch((err: any) => {
            console.error('[Event Error - Email Dispatcher]', err);
        });
    });

    // Future bindings:
    // bus.on('lead.scored', NotificationAdapter.notifyAgent)

    console.log('[Events] All event handlers registered.');
};
