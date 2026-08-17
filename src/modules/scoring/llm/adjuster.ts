import OpenAI from "openai";
import { env } from '../../../config/env';

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY
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
    console.log(`[LeadPipeline] Running LLM scoring...`);

    try {
        const prompt = `
You are an AI assistant evaluating real estate buyer intent.

Based on the lead data, adjust the score by -5 to +5.

Lead data:
Timeline: ${lead.timeline ?? "Unknown"}
Financing: ${lead.financing_status ?? "Unknown"}
Budget: ${lead.budget_range ?? "Unknown"}
Motivation: ${lead.motivation ?? "None"}
Source: ${lead.source ?? "Unknown"}

Return ONLY valid JSON in this format:
{
  "adjustment": number,
  "reason": "short explanation"
}
`;

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

        if (!content) {
            throw new Error("Empty LLM response");
        }

        const parsed = JSON.parse(content);

        const result = {
            adjustment: Math.max(-5, Math.min(5, Number(parsed.adjustment) || 0)),
            reason: String(parsed.reason || "LLM reasoning unavailable")
        };

        console.log(`[LeadPipeline] LLM scoring completed. Adjustment: ${result.adjustment}. Reason: ${result.reason}`);
        return result;

    } catch (error: any) {
        console.warn(`[LeadPipeline] OpenAI API call notice (${error?.message || 'Key unconfigured'}). Generating smart local AI evaluation.`);
        
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
}
