import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Webhook } from 'svix';

export async function POST(request: Request) {
    try {
        const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('[API/Webhooks/Email] RESEND_WEBHOOK_SECRET is missing.');
            return NextResponse.json({ error: 'Unauthorized: Webhook secret unconfigured' }, { status: 401 });
        }

        const svix_id = request.headers.get('svix-id');
        const svix_timestamp = request.headers.get('svix-timestamp');
        const svix_signature = request.headers.get('svix-signature');

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return NextResponse.json({ error: 'Missing Svix verification headers' }, { status: 401 });
        }

        const rawBody = await request.text();
        const wh = new Webhook(webhookSecret);

        let event: any;
        try {
            event = wh.verify(rawBody, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            });
        } catch (err: any) {
            console.error('[API/Webhooks/Email] Svix signature verification failed:', err.message || err);
            return NextResponse.json({ error: 'Unauthorized signature' }, { status: 401 });
        }

        const { data, type } = event;
        const resendId = data?.email_id || data?.id || event.email_id;
        const eventType = type || event.eventType;

        if (!resendId || !eventType) {
            return NextResponse.json({ error: 'Missing required payload fields' }, { status: 400 });
        }

        const emailLog = await prisma.emailLog.findFirst({
            where: {
                OR: [
                    { gmailMessageId: resendId },
                    { id: resendId }
                ]
            }
        });

        if (!emailLog) {
            return NextResponse.json({ error: `Email log not found for Resend message ID: ${resendId}` }, { status: 404 });
        }

        const updateData: any = {};
        if ((eventType === 'email.opened' || eventType === 'opened') && !emailLog.opened) {
            updateData.opened = true;
            updateData.openedAt = new Date();
        } else if ((eventType === 'email.replied' || eventType === 'replied') && !emailLog.replied) {
            updateData.replied = true;
            updateData.clickedAt = new Date();
        } else {
            return NextResponse.json({ success: true, message: 'No update needed' });
        }

        await prisma.emailLog.update({
            where: { id: emailLogId },
            data: updateData
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('[API/Webhooks/Email] Failed:', e.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


