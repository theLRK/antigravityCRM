import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const leads = await prisma.lead.findMany({
            where: { assignedAgentId: user.id },
            include: {
                scores: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Generate CSV content
        const headers = [
            'ID',
            'First Name',
            'Last Name',
            'Email',
            'Phone',
            'Pipeline Stage',
            'Budget Min',
            'Budget Max',
            'Move Timeline',
            'Final Score',
            'Suggested Action',
            'Created At'
        ];

        const rows = leads.map((lead: any) => {
            const score = lead.scores?.[0]?.finalScore || 'N/A';
            const action = lead.scores?.[0]?.suggestedAction || 'Needs Review';
            return [
                lead.id,
                lead.firstName || '',
                lead.lastName || '',
                lead.email || '',
                lead.phone || '',
                lead.pipelineStage || '',
                lead.budgetMin || '',
                lead.budgetMax || '',
                lead.moveTimeline || '',
                score,
                action,
                lead.createdAt.toISOString()
            ].map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="leads_report.csv"'
            }
        });
    } catch (error) {
        console.error('Failed to export leads:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to export leads' }), { status: 500 });
    }
}

