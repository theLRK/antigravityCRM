import { prisma } from '@/lib/prisma';

export type PriorityLevel = 'HOT' | 'WARM' | 'COLD';
export type RecommendedAction =
    | 'CALL_NOW'
    | 'SEND_PROPERTY_MATCH'
    | 'SEND_FOLLOW_UP_EMAIL'
    | 'SEND_REENGAGEMENT_EMAIL'
    | 'START_SEQUENCE'
    | 'REVIEW_LEAD'
    | 'AWAITING_REPLY';

export interface NextBestAction {
    priority: PriorityLevel;
    action: RecommendedAction;
    reason: string;
    aiHint?: string; // Optional suggested AI message snippet
}

export async function computeNextBestAction(leadId: string): Promise<NextBestAction> {
    const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
            scores: { orderBy: { createdAt: 'desc' }, take: 1 },
            propertyMatches: { orderBy: { score: 'desc' }, take: 3 },
            emailLogs: { orderBy: { sentAt: 'desc' }, take: 1 },
            activityLogs: { orderBy: { occurredAt: 'desc' }, take: 1 },
            sequenceStates: { where: { status: 'active' } },
            callLogs: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
    });

    if (!lead) throw new Error('Lead not found');

    const score = lead.scores[0]?.finalScore || 0;
    const isNew = lead.pipelineStage === 'new';
    const lastEmail = lead.emailLogs[0];
    const lastCall = lead.callLogs[0];
    const topMatch = lead.propertyMatches[0];
    const sequenceActive = lead.sequenceStates.length > 0;
    const hasBudget = !!(lead.budgetMin || lead.budgetMax);
    const hasMatches = lead.propertyMatches.length > 0 && (lead.propertyMatches[0]?.score || 0) >= 70;

    const daysSinceCreation = (Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceLastEmail = lastEmail ? (Date.now() - lastEmail.sentAt.getTime()) / (1000 * 60 * 60 * 24) : null;
    const daysSinceLastCall = lastCall ? (Date.now() - lastCall.createdAt.getTime()) / (1000 * 60 * 60 * 24) : null;

    // ── 1. URGENT: High-intent, not yet contacted ─────────────────────────────
    if (score >= 80 && isNew && !lastCall) {
        return {
            priority: 'HOT',
            action: 'CALL_NOW',
            reason: `High-intent lead (Score: ${score}) has not been contacted. Strike while the iron is hot.`,
        };
    }

    // ── 2. HOT: Email opened but no reply — call to close ────────────────────
    if (lastEmail?.opened && !lastEmail.replied && daysSinceLastEmail && daysSinceLastEmail < 3) {
        return {
            priority: 'HOT',
            action: 'CALL_NOW',
            reason: 'Lead opened your email but hasn\'t replied. Call now while intent is warm.'
        };
    }

    // ── 3. WARM: Strong property match available ──────────────────────────────
    if (topMatch && topMatch.score >= 85) {
        const isRecentlySent = daysSinceLastEmail !== null && daysSinceLastEmail < 3;
        if (!isRecentlySent) {
            return {
                priority: 'HOT',
                action: 'SEND_PROPERTY_MATCH',
                reason: `${lead.propertyMatches.length} properties match this lead at ${topMatch.score}%+. Send a personalised match now.`,
                aiHint: `Hi ${lead.firstName}, I found ${lead.propertyMatches.length} properties in ${lead.preferredAreas || 'your area'} that match your budget perfectly.`
            };
        }
    }

    // ── 4. WARM: Already in a sequence ───────────────────────────────────────
    if (sequenceActive) {
        return {
            priority: score >= 70 ? 'WARM' : 'COLD',
            action: 'AWAITING_REPLY',
            reason: 'Lead is enrolled in an active automation sequence.'
        };
    }

    // ── 5. COLD: No activity for 3–7 days ────────────────────────────────────
    if (daysSinceCreation > 3 && (!daysSinceLastEmail || daysSinceLastEmail > 3) && (!daysSinceLastCall || daysSinceLastCall > 3)) {
        // 5a. Has budget + property matches → prefer specific match email
        if (hasBudget && hasMatches) {
            return {
                priority: 'COLD',
                action: 'SEND_PROPERTY_MATCH',
                reason: `Lead has matching properties but hasn\'t heard from you in ${Math.round(daysSinceCreation)} days.`,
                aiHint: `Still looking for a home in ${lead.preferredAreas || 'your area'}? I found something that fits your budget perfectly.`
            };
        }

        // 5b. Has preferred areas but no matches yet
        if (lead.preferredAreas) {
            return {
                priority: 'COLD',
                action: 'SEND_REENGAGEMENT_EMAIL',
                reason: `Lead has been inactive for ${Math.round(daysSinceCreation)} days. Re-engage with area-specific options.`,
                aiHint: `Still interested in homes in ${lead.preferredAreas}? I found new options you may like.`
            };
        }

        // 5c. Generic re-engagement
        return {
            priority: 'COLD',
            action: 'SEND_REENGAGEMENT_EMAIL',
            reason: `Lead has been inactive for ${Math.round(daysSinceCreation)} days. Send a re-engagement email.`,
            aiHint: `Hi ${lead.firstName}, just checking in — are you still looking for a property? I'd love to help.`
        };
    }

    // ── 6. Fallback → start a drip sequence if not enrolled ──────────────────
    if (!sequenceActive) {
        return {
            priority: score >= 60 ? 'WARM' : 'COLD',
            action: 'START_SEQUENCE',
            reason: 'No automation running. Enrol this lead in a nurture sequence to keep them warm.'
        };
    }

    // ── 7. Default review ─────────────────────────────────────────────────────
    return {
        priority: score >= 60 ? 'WARM' : 'COLD',
        action: 'REVIEW_LEAD',
        reason: 'Review lead profile and determine the best next step manually.'
    };
}


