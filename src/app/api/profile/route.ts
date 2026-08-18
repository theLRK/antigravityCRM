import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const profile = await prisma.agentProfile.findUnique({ where: { agentId: user.id } });
        return NextResponse.json({ profile: profile || { agentId: user.id } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, phone, company, signature, imageUrl } = body;

        const fullName = (name || '').trim();
        const nameParts = fullName.split(' ').filter(Boolean);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        const emailFromName = fullName ? (company ? `${fullName} — ${company}` : fullName) : null;

        const profile = await (prisma.agentProfile as any).upsert({
            where: { agentId: user.id },
            create: { 
                agentId: user.id, 
                name: fullName || null, 
                phone: phone || null, 
                company: company || null, 
                signature: signature || null, 
                imageUrl: imageUrl || null,
                emailFromName: emailFromName
            },
            update: { 
                name: fullName || null, 
                phone: phone || null, 
                company: company || null, 
                signature: signature || null, 
                imageUrl: imageUrl || undefined,
                emailFromName: emailFromName
            }
        });

        // Sync with AgentUser
        try {
            await prisma.agentUser.upsert({
                where: { supabaseId: user.id },
                create: {
                    supabaseId: user.id,
                    name: fullName || user.email?.split('@')[0] || 'Agent',
                    email: user.email || '',
                    role: 'agent',
                    isActive: true
                },
                update: {
                    name: fullName || undefined,
                }
            });
        } catch (agentUserErr) {
            console.warn('[Profile API] Non-critical AgentUser warning:', agentUserErr);
        }

        // Sync with Supabase Auth user_metadata
        await supabase.auth.updateUser({
            data: {
                first_name: firstName || undefined,
                last_name: lastName || undefined,
                full_name: fullName || undefined,
                avatar_url: imageUrl || undefined,
            }
        });

        return NextResponse.json({ success: true, profile });
    } catch (error: any) {
        console.error('[Profile API Error]', error);
        return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
    }
}


