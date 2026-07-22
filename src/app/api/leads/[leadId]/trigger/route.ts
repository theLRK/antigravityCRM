import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { processScoreForLead } from '@/modules/scoring/orchestrator';


export async function POST(
    request: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { leadId } = await params;

        // Fetch the lead data required for the scoring pipeline
        const lead = await prisma.lead.findFirst({
            where: { id: leadId, assignedAgentId: user.id },
            include: { sourceForm: true }
        });

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });
        }

        console.log(`[API Next.js] Triggering scoring pipeline for lead ${leadId}`);

        // Run the orchestrator pipeline
        const result = await processScoreForLead(leadId, {
            id: lead.id,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            timeline: lead.moveTimeline,
            financingStatus: lead.financing,
            budgetMin: lead.budgetMin,
            budgetMax: lead.budgetMax,
            motivation: lead.motivation,
            source: lead.source,
            formId: lead.formId,
        });

        return NextResponse.json({ success: true, score: result });
    } catch (e: any) {
        console.error('[API Next.js] Failed to process lead score:', e.message);
        return NextResponse.json({ error: 'Failed to process lead score', details: e.message }, { status: 500 });
    }
}

