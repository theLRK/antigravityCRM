import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { leadId, outcome, notes, nextStep } = body;

        if (!leadId || !outcome) {
            return NextResponse.json({ error: 'leadId and outcome are required' }, { status: 400 });
        }

        // Verify lead ownership
        const lead = await prisma.lead.findFirst({
            where: { id: leadId, assignedAgentId: user.id }
        });
        if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

        // 1. Save the call log
        const callLog = await prisma.callLog.create({
            data: {
                leadId,
                agentId: user.id,
                outcome,
                notes: notes || null,
                nextStep: nextStep || null,
            }
        });

        // 2. Update lead pipeline stage if they Spoke to the Lead
        if (outcome === 'spoke_to_lead') {
            await prisma.lead.update({
                where: { id: leadId },
                data: { pipelineStage: 'contacted' }
            });
        }

        // 3. Hook into the Learning System (ActionOutcome)
        await prisma.actionOutcome.create({
            data: {
                leadId,
                actionType: 'CALL',
                outcome: outcome === 'spoke_to_lead' ? 'ANSWERED' : outcome === 'left_voicemail' ? 'VOICEMAIL' : 'NO_ANSWER',
            }
        });

        // 4. Create an activity log
        await prisma.activityLog.create({
            data: {
                leadId,
                eventType: 'call.logged',
                actor: 'agent',
                metadata: JSON.stringify({ outcome, nextStep })
            }
        });

        // 5. Auto-create follow-up task
        if (lead && (outcome === 'spoke_to_lead' || outcome === 'left_voicemail')) {
            const followUpDate = new Date();
            followUpDate.setDate(followUpDate.getDate() + (outcome === 'spoke_to_lead' ? 2 : 1));
            const taskData = {
                leadId,
                agentId: user.id,
                title: `Follow up call with ${lead.firstName} ${lead.lastName}`,
                taskType: 'Call',
                dueDate: followUpDate,
                autoCreated: true,
                notes: nextStep ? `Next step: ${nextStep}` : outcome === 'left_voicemail' ? 'Auto-created after voicemail' : undefined
            };
            await (prisma as any).task.create({ data: taskData });
        }

        return NextResponse.json({ success: true, callLog });
    } catch (error: any) {
        console.error('Failed to save call log:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(request.url);
        const leadId = url.searchParams.get('leadId');
        if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 });

        // Verify lead ownership
        const lead = await prisma.lead.findFirst({
            where: { id: leadId, assignedAgentId: user.id }
        });
        if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

        const logs = await prisma.callLog.findMany({
            where: { leadId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


