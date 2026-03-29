import { NextResponse } from 'next/server';
import { runSequenceScheduler } from '@/modules/sequences/scheduler';
import { runScheduledEmailScheduler } from '@/modules/email/scheduled-sender';

export async function GET(request: Request) {
    // In a real production app, verify a CRON_SECRET header to ensure only Vercel/Cron can call this
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
