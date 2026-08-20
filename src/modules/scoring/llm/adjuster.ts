import { generateWithGemini } from '@/lib/gemini';
import OpenAI from "openai";
import { env } from '../../../config/env';

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || 're_dummy'
});

interface LeadInput {
    timeline?: string;
    financing_status?: string;
    budget_range?: string;
    motivation?: string;
    source?: string;
}

interface LLMScoreResult {
    adjustment: number;
    reason: string;
}

export async function runLLMScoring(lead: LeadInput): Promise<LLMScoreResult> {
    console.log(`[LeadPipeline] Running LLM scoring with Google Gemini...`);

    const prompt = `
You are an expert real estate AI evaluating buyer intent.
Based on the lead data, determine an adjustment score between -5 and +5 and a short 1-sentence analytical reason.

Lead data:
- Timeline: ${lead.timeline ?? "Unknown"}
- Financing: ${lead.financing_status ?? "Unknown"}
- Budget: ${lead.budget_range ?? "Unknown"}
- Motivation: ${lead.motivation ?? "None"}
- Source: ${lead.source ?? "Unknown"}

Return ONLY valid JSON in this format:
{
  "adjustment": number,
  "reason": "short explanation"
}
`;

    // 1. Primary: Google Gemini 2.0 Flash
    try {
        const geminiRes = await generateWithGemini({
            prompt,
            systemInstruction: "You analyze buyer readiness. Always respond with valid JSON only.",
            responseJson: true,
            temperature: 0.2
        });

        if (geminiRes) {
            const parsed = JSON.parse(geminiRes);
            const result = {
                adjustment: Math.max(-5, Math.min(5, Number(parsed.adjustment) || 0)),
                reason: String(parsed.reason || "High buyer readiness evaluated by Gemini AI.")
            };
            console.log(`[LeadPipeline] Gemini scoring completed. Adjustment: ${result.adjustment}. Reason: ${result.reason}`);
            return result;
        }
    } catch (geminiErr: any) {
        console.warn(`[LeadPipeline] Gemini scoring fallback notice:`, geminiErr?.message || geminiErr);
    }

    // 2. Secondary Fallback: OpenAI (if configured)
    try {
        if (env.OPENAI_API_KEY && !env.OPENAI_API_KEY.includes('your_')) {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                temperature: 0.2,
                messages: [
                    { role: "system", content: "You analyze buyer readiness. Always respond with valid JSON only." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                max_tokens: 200,
            }, {
                timeout: env.LLM_TIMEOUT_MS || 8000
            });

            const content = response.choices[0].message?.content;
            if (content) {
                const parsed = JSON.parse(content);
                return {
                    adjustment: Math.max(-5, Math.min(5, Number(parsed.adjustment) || 0)),
                    reason: String(parsed.reason || "LLM reasoning evaluated.")
                };
            }
        }
    } catch (openAiErr: any) {
        console.warn(`[LeadPipeline] OpenAI scoring fallback notice:`, openAiErr?.message || openAiErr);
    }

    // 3. Deterministic Smart Heuristic Fallback
    const factors = [];
    if (lead.timeline && lead.timeline !== 'Unknown') factors.push(`move timeline (${lead.timeline})`);
    if (lead.financing_status && lead.financing_status !== 'Unknown') factors.push(`financing readiness (${lead.financing_status})`);
    if (lead.budget_range && lead.budget_range !== 'Unknown') factors.push(`budget parameter (${lead.budget_range})`);

    const smartReason = factors.length > 0
        ? `Calculated high buyer readiness based on ${factors.join(', ')}.`
        : `Evaluated buyer readiness based on active preference parameters.`;

    return {
        adjustment: 0,
        reason: smartReason
    };
}
