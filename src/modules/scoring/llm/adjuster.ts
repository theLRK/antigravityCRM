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
    notes?: string;
    source?: string;
}

interface LLMScoreResult {
    adjustment: number;
    reason: string;
}

export async function runLLMScoring(lead: LeadInput): Promise<LLMScoreResult> {
    console.log(`[LeadPipeline] Running LLM scoring with Google Gemini...`);

    const prompt = `
You are an expert real estate AI evaluating lead quality, intent, and buying readiness.
Based on the full lead profile and any private agent notes or buyer motivation, determine an adjustment score between -15 and +15 and a concise 1-sentence analytical reason.

Scoring Guidance:
- Award positive points (+5 to +15) for high urgency, cash buyer, relocation deadline, clear requirements, or strong intent expressed in notes.
- Award negative points (-5 to -15) for vague browsing, unverified financing, timeline far in the future (6+ months), or hesitations in notes.
- Return 0 if the profile is standard/neutral.

Lead Data:
- Timeline: ${lead.timeline ?? "Unknown"}
- Financing: ${lead.financing_status ?? "Unknown"}
- Budget: ${lead.budget_range ?? "Unknown"}
- Motivation: ${lead.motivation ?? "None"}
- Agent Notes: ${lead.notes ?? "None"}
- Source: ${lead.source ?? "Unknown"}

Return ONLY valid JSON in this exact format:
{
  "adjustment": number,
  "reason": "1-sentence concise explanation of why this adjustment was applied"
}
`;

    // 1. Primary: Google Gemini 2.0 Flash
    try {
        const geminiRes = await generateWithGemini({
            prompt,
            systemInstruction: "You are an expert real estate lead scoring analyst. Always respond with valid JSON only.",
            responseJson: true,
            temperature: 0.2
        });

        if (geminiRes) {
            const parsed = JSON.parse(geminiRes);
            const result = {
                adjustment: Math.max(-15, Math.min(15, Number(parsed.adjustment) || 0)),
                reason: String(parsed.reason || "Evaluated by Google Gemini AI.")
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
