import { NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/gemini';

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;

    if (!apiKey || apiKey.includes('your_gemini_api_key')) {
        return NextResponse.json({
            status: 'KEY_MISSING',
            message: 'GEMINI_API_KEY is not set in environment variables.',
            instructions: 'Add GEMINI_API_KEY to your Vercel Dashboard -> Settings -> Environment Variables and redeploy.',
            provider: 'Google Gemini'
        }, { status: 400 });
    }

    const t0 = Date.now();
    try {
        const aiOutput = await generateWithGemini({
            prompt: 'Evaluate this luxury buyer: Budget $1.2M, pre-approved cash ready, moving in 15 days to Victoria Island. Provide a 1-sentence assessment and intent score out of 100.',
            systemInstruction: 'You are Formative CRM AI. Always return valid JSON: {"intentScore": number, "summary": string}',
            responseJson: true,
            temperature: 0.2
        });

        const duration = Date.now() - t0;

        if (!aiOutput) {
            return NextResponse.json({
                status: 'FAILED',
                message: 'Gemini did not return a response. Check your API key permissions.',
                latencyMs: duration
            }, { status: 502 });
        }

        const parsed = JSON.parse(aiOutput);

        return NextResponse.json({
            status: 'ACTIVE_AND_WORKING',
            provider: 'Google Gemini 2.0 Flash',
            latency: `${duration}ms`,
            testResult: parsed,
            timestamp: new Date().toISOString()
        });

    } catch (err: any) {
        return NextResponse.json({
            status: 'ERROR',
            message: err?.message || 'AI generation failed',
            durationMs: Date.now() - t0
        }, { status: 500 });
    }
}
