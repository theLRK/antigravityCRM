export interface ConfidenceResult {
    score: number;
    level: 'High' | 'Medium' | 'Low';
}

/**
 * Calculates confidence based on signal completeness and LLM agreement.
 */
export const calculateConfidence = (
    lead: any,
    llmDelta: number
): ConfidenceResult => {
    let points = 0;

    // Signal completeness rules
    if (lead.preApproval !== undefined && lead.preApproval !== null) points += 2;
    if (lead.budgetMin && lead.budgetMax) points += 2;
    if (lead.moveTimeline) points += 2;
    if (lead.preferredAreas && lead.preferredAreas.length > 0) points += 1;
    if (lead.motivation && lead.motivation.trim().length > 20) points += 1;

    // LLM Agreement rule
    if (Math.abs(llmDelta) <= 2) {
        points += 2;
    }

    // Ensure bounded 0-10
    const finalScore = Math.min(Math.max(points, 0), 10);

    let level: 'High' | 'Medium' | 'Low' = 'Low';
    if (finalScore >= 8) level = 'High';
    else if (finalScore >= 4) level = 'Medium';

    return {
        score: finalScore,
        level,
    };
};
