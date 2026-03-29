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
    const preferredLocsJson = JSON.stringify(finalLocationIds);
    const rawPayloadJson = JSON.stringify(rawPayload);

    // Using raw SQL because the generated Prisma client is currently stale/locked in dev server
    await (prisma as any).$executeRawUnsafe(
        `INSERT INTO leads (
            id, first_name, last_name, email, phone, budget_min, budget_max, 
            move_timeline, pre_approval, motivation, source, form_id, 
            raw_payload, is_duplicate, pipeline_stage, currency, 
            preferred_location_ids, custom_location, financing, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        leadId, 
        firstName, lastName, email, phone, 
        parsedBudgetMin, parsedBudgetMax, 
        moveTimeline, 
        financing === 'Pre-approved' ? 1 : 0, 
        `Financing Status: ${financing}. Property Interest: ${propertyInterest}.`,
        'Lead Capture Form', 
        formId,
        rawPayloadJson,
        0, // is_duplicate
        'new',
        formConfig.currencySymbol || '$',
        preferredLocsJson,
        customLocation || null,
        financing || null,
        new Date().toISOString(),
        new Date().toISOString()
    );

    // Fetch the created lead for orchestrator (using raw to be safe)
    const lead = (await (prisma as any).$queryRawUnsafe(`SELECT * FROM leads WHERE id = ?`, leadId))[0];
    // Normalize field names if needed for orchestrator (orchestrator might expect camelCase)
    const normalizedLead = {
        ...lead,
        firstName: lead.first_name,
        lastName: lead.last_name,
        budgetMin: lead.budget_min,
        budgetMax: lead.budget_max,
        preferredLocationIds: JSON.parse(lead.preferred_location_ids || '[]')
    };

    // 4. Log the Creation Activity (using raw SQL)
    await (prisma as any).$executeRawUnsafe(
        `INSERT INTO activity_log (id, lead_id, event_type, actor, metadata, occurred_at, is_error)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        crypto.randomUUID(),
        leadId,
        'lead.created',
        'public_form',
        JSON.stringify({ formId }),
        new Date().toISOString(),
        0 // is_error false
    );

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


