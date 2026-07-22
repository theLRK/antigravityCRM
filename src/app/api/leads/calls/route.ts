import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { leadId, outcome, notes, nextStep } = body;

        if (!leadId || !outcome) {
            return NextResponse.json({ error: 'Missing leadId or outcome' }, { status: 400 });
        }

        // Verify lead ownership
        const lead = await prisma.lead.findFirst({
            where: { id: leadId, assignedAgentId: user.id }
        });
        if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

        const callLog = await prisma.callLog.create({
            data: {
                leadId,
                agentId: user.id,
                outcome,
                notes,
                nextStep
            }
        });

        // Also log to activity log for the timeline
        await prisma.activityLog.create({
            data: {
                leadId,
                eventType: 'call.logged',
                metadata: JSON.stringify({ outcome, notes })
            }
        });

        // Update lastContactedAt
        await prisma.lead.update({
            where: { id: leadId },
            data: { lastContactedAt: new Date() }
        });

        return NextResponse.json({ callLog });
    } catch (error: any) {
        console.error('Call Log API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


