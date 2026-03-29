import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const limitParam = url.searchParams.get('limit');
        const take = limitParam ? parseInt(limitParam, 10) : 10;

        // Fetch activity logs
        const activities = await prisma.activityLog.findMany({
            take,
            orderBy: { occurredAt: 'desc' },
            include: { lead: { select: { firstName: true, lastName: true, id: true } } }
        });

        // Fetch email logs
        const emails = await prisma.emailLog.findMany({
            take,
            orderBy: { sentAt: 'desc' },
            include: { lead: { select: { firstName: true, lastName: true, id: true } } }
        });

        // Normalize and merge the events into a timeline
        const feedEvents = [
            ...activities.map((a: any) => ({
                id: `act_${a.id}`,
                type: 'activity',
                title: a.eventType.replace(/\./g, ' ').replace(/_/g, ' '),
                description: a.metadata,
                isError: a.isError,
                timestamp: a.occurredAt,
                lead: a.lead ? `${a.lead.firstName} ${a.lead.lastName}` : 'System',
                leadId: a.leadId
            })),
            ...emails.map((e: any) => {
                let statusLabel = 'Sent email';
                if (e.replied) statusLabel = 'Lead replied to email';
                else if (e.opened) statusLabel = 'Lead opened email';
                else if (e.status === 'failed') statusLabel = 'Failed to send email';
                else if (e.status === 'draft') statusLabel = 'Drafted AI email';

                return {
                    id: `eml_${e.id}`,
                    type: 'email',
                    title: statusLabel,
                    description: `"${e.subjectLine || 'No Subject'}"`,
                    isError: e.status === 'failed',
                    timestamp: e.replied && e.clickedAt ? e.clickedAt 
                             : e.opened && e.openedAt ? e.openedAt 
                             : e.sentAt,
                    lead: e.lead ? `${e.lead.firstName} ${e.lead.lastName}` : 'Unknown',
                    leadId: e.leadId
                };
            })
        ];

        // Sort desc
        feedEvents.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());

        // Return only the top 'take' items
        return NextResponse.json({ feed: feedEvents.slice(0, take) });
    } catch (error: any) {
        console.error('Failed to fetch activity feed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


