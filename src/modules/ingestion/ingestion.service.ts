import { prisma } from '@/lib/prisma';
import { bus } from '../../events/bus';
import { normalizeLeadData } from './normalizer';

export class IngestionService {
    /**
     * Process an incoming lead form payload
     * 1. Normalize data
     * 2. Deduplicate (30-day window)
     * 3. Insert or Update DB
     * 4. Emit LeadCreated event
     */
    static async ingest(rawPayload: any, ipAddress?: string): Promise<{ leadId: string }> {
        const targetPayload = normalizeLeadData(rawPayload);

        // SQLite doesn't natively support arrays, stringify preferredAreas
        if (Array.isArray(targetPayload.preferredAreas)) {
            targetPayload.preferredAreas = JSON.stringify(targetPayload.preferredAreas);
        }

        // Application-level Deduplication (30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const existingLead = await prisma.lead.findFirst({
            where: {
                email: targetPayload.email,
                createdAt: { gte: thirtyDaysAgo },
            },
            orderBy: { createdAt: 'desc' },
        });

        let leadId: string;

        // Clean up target payload so it ONLY contains valid Prisma Lead columns.
        // This prevents 500 errors when clients submit extra json keys like 'agentId'
        const dataPayload = {
            firstName: targetPayload.firstName,
            lastName: targetPayload.lastName,
            email: targetPayload.email,
            phone: targetPayload.phone || '',
            budgetMin: typeof targetPayload.budgetMin === 'number' ? targetPayload.budgetMin : null,
            budgetMax: typeof targetPayload.budgetMax === 'number' ? targetPayload.budgetMax : null,
            preferredAreas: targetPayload.preferredAreas ? JSON.stringify(targetPayload.preferredAreas) : null,
            bedroomsMin: typeof targetPayload.bedroomsMin === 'number' ? targetPayload.bedroomsMin : null,
            bathroomsMin: typeof targetPayload.bathroomsMin === 'number' ? targetPayload.bathroomsMin : null,
            moveTimeline: targetPayload.moveTimeline || null,
            preApproval: typeof targetPayload.preApproval === 'boolean' ? targetPayload.preApproval : null,
            agentExperience: targetPayload.agentExperience || null,
            motivation: targetPayload.notes || targetPayload.motivation || null, // Map notes or motivation
            source: targetPayload.source || 'Direct API',
            utmSource: targetPayload.utmSource || null,
            utmMedium: targetPayload.utmMedium || null,
            utmCampaign: targetPayload.utmCampaign || null
        };

        if (existingLead) {
            // Dupe found within 30 days -> Update
            const updatedLead = await prisma.lead.update({
                where: { id: existingLead.id },
                data: {
                    ...dataPayload,
                    ipAddress,
                    rawPayload: JSON.stringify(rawPayload),
                    isDuplicate: true, // Flag as a subsequent attempt
                },
            });
            leadId = updatedLead.id;
        } else {
            // New lead -> Create
            const newLead = await prisma.lead.create({
                data: {
                    ...dataPayload,
                    ipAddress,
                    rawPayload: JSON.stringify(rawPayload),
                    isDuplicate: false,
                },
            });
            leadId = newLead.id;
        }

        // Trigger downstream processes (Scoring etc.)
        bus.emit('lead.created', {
            leadId,
            timestamp: new Date(),
        });

        return { leadId };
    }
}
