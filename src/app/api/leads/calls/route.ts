import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const agent = await prisma.agentUser.findUnique({ where: { supabaseId: user.id } });
        if (!agent) return NextResponse.json({ error: 'Agent profile not found locally' }, { status: 404 });

        const body = await req.json();
        const { leadId, outcome, notes, nextStep } = body;

        if (!leadId || !outcome) {
            return NextResponse.json({ error: 'Missing leadId or outcome' }, { status: 400 });
        }

        const callLog = await prisma.callLog.create({
            data: {
                leadId,
                agentId: agent.id,
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


