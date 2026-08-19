import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const templates = await (prisma as any).emailTemplate.findMany({
            where: { agentId: user.id },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(templates);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { name, subject, body } = await req.json();
        if (!name || !subject || !body) {
            return NextResponse.json({ error: 'Name, subject and body required' }, { status: 400 });
        }

        const template = await (prisma as any).emailTemplate.create({
            data: { name, subject, body, agentId: user.id }
        });

        return NextResponse.json(template, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
