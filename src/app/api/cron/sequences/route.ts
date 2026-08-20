import { NextResponse } from 'next/server';
import { runSequenceScheduler } from '@/modules/sequences/scheduler';
import { runScheduledEmailScheduler } from '@/modules/email/scheduled-sender';

export async function GET(request: Request) {
    if (!process.env.CRON_SECRET) {
        console.error('[API/Cron] Missing CRON_SECRET environment variable.');
        return NextResponse.json({ error: 'Server Misconfiguration: CRON_SECRET is not configured' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [sequenceResult, scheduledResult] = await Promise.all([
            runSequenceScheduler(),
            runScheduledEmailScheduler()
        ]);

        return NextResponse.json({
            sequences: sequenceResult,
            scheduled: scheduledResult
        });
    } catch (e: any) {
        console.error('[API/Cron] Schedulers failed:', e.message);
        return NextResponse.json({ error: 'Internal Server Error', message: e.message }, { status: 500 });
    }
}
