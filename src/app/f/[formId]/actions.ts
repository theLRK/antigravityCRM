'use server';
import { prisma } from '@/lib/prisma';

import { processScoreForLead } from '@/modules/scoring/orchestrator';


export async function submitPublicLead(formId: string, formData: Record<string, any>) {
    // 1. Verify the form exists and is active
    const formConfig = await prisma.leadCaptureForm.findUnique({
        where: { id: formId }
    });

    if (!formConfig || !formConfig.isActive) {
        throw new Error("Form is not active or does not exist.");
    }

    // 2. Extract Core Fields vs Custom payload
    const {
        firstName,
        lastName,
        email,
        phone,
        budgetMin,
        budgetMax,
        moveTimeline,
        financing,
        propertyInterest,
        preferredLocationIds,
        customLocation,
        ...customAnswers // Everything else is custom dynamic JSON from step 4
    } = formData;

    // Build the raw payload object identical to our /api/v1/leads/ingest shape
    const rawPayload = {
        ...formData,
        source: 'Public Form Wizard',
        form_id: formId
    };

    // 3. Create the Lead locally
    // Convert numerical inputs safely
    const parsedBudgetMin = budgetMin ? parseInt(budgetMin, 10) : null;
    const parsedBudgetMax = budgetMax ? parseInt(budgetMax, 10) : null;

    let finalLocationIds: string[] = Array.isArray(preferredLocationIds) ? [...preferredLocationIds] : [];
    
    // Process custom location if 'other' was selected
    if (finalLocationIds.includes('other') && customLocation) {
        finalLocationIds = finalLocationIds.filter((id: string) => id !== 'other');
        
        let otherGroup = (await (prisma as any).$queryRawUnsafe(`SELECT * FROM location_groups WHERE name = 'Other' LIMIT 1`))[0];
        if (!otherGroup) {
            const groupId = crypto.randomUUID();
            await (prisma as any).$executeRawUnsafe(
                `INSERT INTO location_groups (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
                groupId, 'Other', new Date().toISOString(), new Date().toISOString()
            );
            otherGroup = { id: groupId };
        }
        
        const newLocId = crypto.randomUUID();
        await (prisma as any).$executeRawUnsafe(
            `INSERT INTO locations (id, name, group_id, is_custom, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
            newLocId, customLocation, otherGroup.id, 1, new Date().toISOString(), new Date().toISOString()
        );
        
        finalLocationIds.push(newLocId);
    }

    const leadId = crypto.randomUUID();
    const finalLocationIdsJson = JSON.stringify(finalLocationIds);

    // 3. Create the Lead locally using Prisma ORM to ensure safety
    const lead = await prisma.lead.create({
        data: {
            id: leadId,
            firstName,
            lastName,
            email,
            phone,
            budgetMin: parsedBudgetMin,
            budgetMax: parsedBudgetMax,
            moveTimeline,
            preApproval: financing === 'Pre-approved',
            source: 'Public Form Wizard',
            formId: formId,
            isDuplicate: false,
            pipelineStage: 'new',
            currency: formConfig.currencySymbol || '$',
            preferredAreas: finalLocationIdsJson,
            customLocation: customLocation || undefined,
            financing: financing || undefined,
            rawPayload: JSON.stringify(rawPayload),
            activityLogs: {
                create: {
                    eventType: 'lead.created',
                    actor: 'public_form',
                    metadata: JSON.stringify({ formId })
                }
            }
        }
    });

    // 5. Fire exactly into the Scoring Orchestrator chain 
    try {
        console.log(`[Actions - PublicForm] Triggering native AI pipeline for Lead ID: ${lead.id}`);
        await processScoreForLead(lead.id, {
            id: lead.id,
            firstName,
            lastName,
            email,
            phone,
            timeline: moveTimeline,
            budgetMin: parsedBudgetMin || undefined,
            budgetMax: parsedBudgetMax || undefined,
            financingStatus: financing,
            source: 'Public Form Wizard',
            motivation: `Property Interest: ${propertyInterest}`
        });
    } catch (e: any) {
        console.error("Failed to trigger orchestrator pipeline natively", e.message);
    }

    return { success: true, leadId: lead.id };
}


