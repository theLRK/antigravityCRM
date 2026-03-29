import rulesConfig from './rules.v1.json';

export interface ScoreFactor {
    factor: string;
    weight: number;
    raw_value: string | number | boolean | null;
    earned_points: number;
    description: string;
}

export interface DeterministicScoreResult {
    base_score: number;
    factor_breakdown: ScoreFactor[];
}

/**
 * Pure function to calculate base score deterministically
 */
export const calculateDeterministicScore = (lead: any): DeterministicScoreResult => {
    let totalScore = 0;
    const breakdown: ScoreFactor[] = [];
    const r = rulesConfig.rules;

    // 1. Move Timeline
    let timelinePts = 0;
    let timelineDesc = 'No move timeline specified';
    if (lead.moveTimeline) {
        timelinePts = r.moveTimeline.weights[lead.moveTimeline as keyof typeof r.moveTimeline.weights] || 0;
        timelineDesc = `Move timeline: ${lead.moveTimeline}`;
    }
    breakdown.push({
        factor: 'move_timeline',
        weight: r.moveTimeline.maxPoints,
        raw_value: lead.moveTimeline || null,
        earned_points: timelinePts,
        description: timelineDesc
    });
    totalScore += timelinePts;

    // 2. Pre-Approval
    let preAppPts = 0;
    if (lead.preApproval === true) preAppPts = r.preApproval.weights.true;
    breakdown.push({
        factor: 'pre_approval',
        weight: r.preApproval.maxPoints,
        raw_value: lead.preApproval || null,
        earned_points: preAppPts,
        description: lead.preApproval ? 'Buyer is pre-approved' : 'Not pre-approved'
    });
    totalScore += preAppPts;

    // 3. Budget
    let budgetPts = r.budget.weights.none;
    let budgetDesc = 'No budget specified';
    if (lead.budgetMin && lead.budgetMax) {
        budgetPts = r.budget.weights.both;
        budgetDesc = `Budget explicitly defined: ${lead.budgetMin} - ${lead.budgetMax}`;
    } else if (lead.budgetMin || lead.budgetMax) {
        budgetPts = r.budget.weights.one;
        budgetDesc = 'Partial budget defined';
    }
    breakdown.push({
        factor: 'budget',
        weight: r.budget.maxPoints,
        raw_value: `Min: ${lead.budgetMin}, Max: ${lead.budgetMax}`,
        earned_points: budgetPts,
        description: budgetDesc
    });
    totalScore += budgetPts;

    // 4. Preferred Areas
    let preferredAreasList: string[] = [];
    if (Array.isArray(lead.preferredAreas)) {
        preferredAreasList = lead.preferredAreas;
    } else if (typeof lead.preferredAreas === 'string') {
        try { preferredAreasList = JSON.parse(lead.preferredAreas); } catch (e) { }
    }

    const hasAreas = preferredAreasList.length > 0;
    const areaPts = hasAreas ? r.preferredAreas.weights.specified : 0;
    breakdown.push({
        factor: 'preferred_areas',
        weight: r.preferredAreas.maxPoints,
        raw_value: hasAreas ? preferredAreasList.join(', ') : null,
        earned_points: areaPts,
        description: hasAreas ? 'Preferred areas explicitly defined' : 'No areas given'
    });
    totalScore += areaPts;

    // 5. Bedrooms/Bathrooms
    let bedBathPts = 0;
    if (lead.bedroomsMin && lead.bathroomsMin) bedBathPts = r.bedroomsBathrooms.weights.both;
    else if (lead.bedroomsMin || lead.bathroomsMin) bedBathPts = r.bedroomsBathrooms.weights.one;
    breakdown.push({
        factor: 'bedrooms_bathrooms',
        weight: r.bedroomsBathrooms.maxPoints,
        raw_value: `Beds: ${lead.bedroomsMin || null}, Baths: ${lead.bathroomsMin || null}`,
        earned_points: bedBathPts,
        description: bedBathPts > 0 ? 'Specific property size requirements provided' : 'No property size requirements'
    });
    totalScore += bedBathPts;

    // 6. Source Quality (capped at 5)
    // Maps common sources. Defaulting others to website for safety if unknown.
    let sourcePts = 0;
    let srcKey = 'website';
    const src = (lead.source || '').toLowerCase();
    if (src.includes('referral')) { srcKey = 'referral'; sourcePts = r.source.weights.referral; }
    else if (src.includes('social') || src.includes('instagram') || src.includes('facebook')) {
        srcKey = 'social'; sourcePts = r.source.weights.social;
    }
    else { sourcePts = r.source.weights.website; }

    breakdown.push({
        factor: 'source_quality',
        weight: r.source.maxPoints,
        raw_value: lead.source || null,
        earned_points: sourcePts,
        description: `Source classified as ${srcKey}`
    });
    totalScore += sourcePts;

    return {
        base_score: Math.min(100, Math.max(0, totalScore)),
        factor_breakdown: breakdown
    };
};
