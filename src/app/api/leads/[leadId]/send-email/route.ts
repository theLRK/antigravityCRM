import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendUnifiedEmailCore } from '@/modules/email/service';

// POST /api/leads/:leadId/send-email — manual email from lead profile
export async function POST(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
    try {
        const { leadId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { subject, body, templateUsed } = await req.json();
        if (!subject || !body) return NextResponse.json({ error: 'Subject and body required' }, { status: 400 });

        const res = await sendUnifiedEmailCore({
            leadId,
            agentId: user.id,
            subject,
            body,
            templateId: templateUsed || 'manual_custom',
            isManual: true
        });

        return NextResponse.json(res);
    } catch (e: any) {
        console.error('[send-email]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
