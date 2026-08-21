import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { processScoreForLead } from '@/modules/scoring/orchestrator';
import { runPropertyMatchingForLead } from '@/modules/scoring/matching';

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
                notes: notes || '',
                nextStep: nextStep || null
            }
        });

        // Map outcome to user-friendly badge title
        const outcomeLabels: Record<string, string> = {
            'spoke_to_lead': 'Spoke with Lead',
            'not_interested': 'Not Interested / On Hold',
            'left_voicemail': 'Left Voicemail',
            'no_answer': 'No Answer',
            'callback_requested': 'Callback Requested'
        };
        const outcomeLabel = outcomeLabels[outcome] || outcome.replace(/_/g, ' ');

        // Save categorized Call Note into notes table
        const noteContent = `📞 [CALL: ${outcomeLabel}] ${notes ? notes.trim() : `Call outcome recorded: ${outcomeLabel}.`}`;
        const note = await (prisma as any).note.create({
            data: {
                leadId,
                agentId: user.id,
                content: noteContent
            }
        });

        // Log to activity log for timeline
        await prisma.activityLog.create({
            data: {
                leadId,
                eventType: 'call.logged',
                actor: user.email || 'agent',
                metadata: JSON.stringify({ outcome: outcomeLabel, notes })
            }
        });

        // Update lastContactedAt
        await prisma.lead.update({
            where: { id: leadId },
            data: { lastContactedAt: new Date() }
        });

        // Trigger real-time background AI Lead Re-scoring & Property Re-matching with the new call notes
        processScoreForLead(leadId, {
            ...lead,
            notes: noteContent
        }).catch(err => console.error('[CallLog] Re-scoring error:', err));

        runPropertyMatchingForLead(leadId).catch(err => console.error('[CallLog] Re-matching error:', err));

        return NextResponse.json({ success: true, callLog, note });
    } catch (error: any) {
        console.error('Call Log API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


