import crypto from 'crypto';
import { DeterministicScoreResult } from '../deterministic/engine';

export interface PromptPayload {
    hash: string;
    system: string;
    user: string;
}

/**
 * Builds the structured prompt for the LLM adjustment layer
 * Hashes the prompt for auditability.
 */
export const buildScoringPrompt = (
    baseScore: DeterministicScoreResult,
    motivationText?: string,
    moveTimeline?: string
): PromptPayload => {
    const system = `You are an expert real estate mentor and buyer intent analyst.
Your job is to analyze the buyer's details and generate highly actionable, humanized advice for the real estate agent, along with a minor score adjustment (-5 to +5).
Write your advice as if you are experienced, talking directly to a colleague. Make it actionable and urgent.
You must respond strictly in JSON matching the requested schema.`;

    const user = `
Base Score: ${baseScore.base_score}
Deterministic Factors:
${JSON.stringify(baseScore.factor_breakdown, null, 2)}

Buyer Motivation Text:
"${motivationText || 'No unstructured text provided.'}"

Move Timeline:
"${moveTimeline || 'Unknown'}"

Instructions:
1. Adjust the score by -5 to +5 based ONLY on the unstructured motivation text. If generic or missing, delta should be 0.
2. 'reasoning' MUST be written as friendly, expert advice. Instead of mechanical breakdowns, write like: "This buyer is ready to move soon and already has financing. Contact them quickly before they engage another agent."
3. 'suggested_action' MUST be a concise, powerful primary action for the agent (e.g., "Call within 1 hour", "Send property shortlist", "Follow up next week").
4. Respond ONLY with the following JSON schema:
{
  "delta": number (-5 to +5),
  "reasoning": "string explaining reasoning (humanized, advisory tone)",
  "suggested_action": "string with concise primary action for agent",
  "confidence_note": "string detailing signal quality from text"
}`;

    const rawHashString = `${system}|${user}`;
    const hash = crypto.createHash('sha256').update(rawHashString).digest('hex');

    return { hash, system, user };
};
