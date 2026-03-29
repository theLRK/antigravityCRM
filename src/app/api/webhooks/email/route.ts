import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Expected payload: { emailLogId: "foo", eventType: "opened" | "replied" }
        const { emailLogId, eventType } = body;

        if (!emailLogId || !eventType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const emailLog = await prisma.emailLog.findUnique({
            where: { id: emailLogId }
        });

        if (!emailLog) {
            return NextResponse.json({ error: 'Email log not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (eventType === 'opened' && !emailLog.opened) {
            updateData.opened = true;
            updateData.openedAt = new Date();
        } else if (eventType === 'replied' && !emailLog.replied) {
            updateData.replied = true;
            updateData.clickedAt = new Date(); // Use clickedAt as a proxy for replied_at
        } else {
            return NextResponse.json({ success: true, message: 'No update needed' });
        }

        await prisma.emailLog.update({
            where: { id: emailLogId },
            data: updateData
        });

        // If they replied, the scheduler will automatically pause active sequences on the next run!

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('[API/Webhooks/Email] Failed:', e.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


