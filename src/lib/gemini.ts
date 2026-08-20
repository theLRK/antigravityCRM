/**
 * Google Gemini AI Client for Formative CRM
 * High-performance, low-latency LLM integration using Gemini 2.0 Flash / 1.5 Flash.
 */

interface GenerateGeminiOptions {
    prompt: string;
    systemInstruction?: string;
    responseJson?: boolean;
    temperature?: number;
    model?: string;
}

export async function generateWithGemini({
    prompt,
    systemInstruction,
    responseJson = false,
    temperature = 0.4,
    model = 'gemini-2.0-flash'
}: GenerateGeminiOptions): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;

    if (!apiKey || apiKey.includes('your_gemini_api_key')) {
        console.warn('[Gemini AI] Missing or unconfigured GEMINI_API_KEY.');
        return null;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const body: any = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ],
            generationConfig: {
                temperature: temperature,
            }
        };

        if (systemInstruction) {
            body.systemInstruction = {
                parts: [{ text: systemInstruction }]
            };
        }

        if (responseJson) {
            body.generationConfig.responseMimeType = 'application/json';
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error('[Gemini AI] API error:', res.status, JSON.stringify(errData));
            return null;
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || null;

    } catch (err: any) {
        console.error('[Gemini AI] Request failed:', err?.message || err);
        return null;
    }
}
