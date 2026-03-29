import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { ids } = body; // array of notification IDs, or empty to mark all

        if (ids && ids.length > 0) {
            await prisma.notification.updateMany({
                where: { userId: user.id, id: { in: ids } },
                data: { read: true }
            });
        } else {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { userId: user.id, read: false },
                data: { read: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


