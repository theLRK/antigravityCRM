import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/leads/:leadId/timeline — unified chronological feed
export async function GET(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
    try {
        const { leadId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [lead, emails, calls, notes, tasks, activities] = await Promise.all([
            prisma.lead.findFirst({ where: { id: leadId, assignedAgentId: user.id }, select: { createdAt: true, firstName: true, lastName: true, source: true } }),
            (prisma as any).emailLog.findMany({ where: { leadId }, orderBy: { sentAt: 'asc' } }),
            prisma.callLog.findMany({ where: { leadId }, orderBy: { createdAt: 'asc' } }),
            (prisma as any).note.findMany({ where: { leadId }, orderBy: { createdAt: 'asc' } }),
            (prisma as any).task.findMany({ where: { leadId }, orderBy: { createdAt: 'asc' } }),
            prisma.activityLog.findMany({ where: { leadId }, orderBy: { occurredAt: 'asc' }, take: 20 }),
        ]);

        if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

        type TimelineEvent = {
            id: string;
            type: string;
            timestamp: Date;
            actor: string;
            summary: string;
            metadata?: Record<string, any>;
        };

        const events: TimelineEvent[] = [];

        // Lead created
        events.push({
            id: `created-${leadId}`,
            type: 'lead_created',
            timestamp: lead.createdAt,
            actor: 'system',
            summary: `Lead created via ${lead.source || 'direct entry'}`,
            metadata: {}
        });

        // Emails
        (emails as any[]).forEach((e: any) => events.push({
            id: `email-${e.id}`,
            type: 'email_sent',
            timestamp: e.sentAt,
            actor: e.isManual ? 'agent' : 'system',
            summary: e.subjectLine || 'Email sent',
            metadata: { templateId: e.templateId, templateUsed: e.templateUsed, opened: e.opened, replied: e.replied, isManual: e.isManual }
        }));

        // Calls
        calls.forEach((c: any) => events.push({
            id: `call-${c.id}`,
            type: 'call_logged',
            timestamp: c.createdAt,
            actor: 'agent',
            summary: `Call: ${c.outcome.replace(/_/g, ' ')}`,
            metadata: { outcome: c.outcome, notes: c.notes, nextStep: c.nextStep }
        }));

        // Notes
        (notes as any[]).forEach((n: any) => events.push({
            id: `note-${n.id}`,
            type: 'note_added',
            timestamp: n.createdAt,
            actor: 'agent',
            summary: n.content,
            metadata: {}
        }));

        // Tasks
        (tasks as any[]).forEach((t: any) => events.push({
            id: `task-${t.id}`,
            type: 'task_created',
            timestamp: t.createdAt,
            actor: t.autoCreated ? 'system' : 'agent',
            summary: `Task: ${t.title}`,
            metadata: { taskType: t.taskType, dueDate: t.dueDate, status: t.status }
        }));

        // System activity logs
        activities.forEach((a: any) => {
            if (a.eventType === 'LEAD_CREATED') return; // already added above
            events.push({
                id: `activity-${a.id}`,
                type: a.eventType.toLowerCase(),
                timestamp: a.occurredAt,
                actor: a.actor,
                summary: a.metadata || a.eventType,
                metadata: {}
            });
        });

        // Sort chronologically
        events.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        return NextResponse.json({ events });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
