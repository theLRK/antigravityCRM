import { calculateDeterministicScore } from './engine';

describe('Deterministic Scoring Engine', () => {

    it('should assign correct points for moveTimeline', () => {
        const lead = { moveTimeline: 'asap' };
        const result = calculateDeterministicScore(lead);
        const factor = result.factor_breakdown.find(f => f.factor === 'move_timeline');
        expect(factor?.earned_points).toBe(35);
    });

    it('should assign 0 points if timeline is missing', () => {
        const lead = {};
        const result = calculateDeterministicScore(lead);
        const factor = result.factor_breakdown.find(f => f.factor === 'move_timeline');
        expect(factor?.earned_points).toBe(0);
    });

    it('should assign correct points for preApproval', () => {
        const lead = { preApproval: true };
        const result = calculateDeterministicScore(lead);
        const factor = result.factor_breakdown.find(f => f.factor === 'pre_approval');
        expect(factor?.earned_points).toBe(25);
    });

    it('should assign points for complete budget', () => {
        const lead = { budgetMin: 300000, budgetMax: 500000 };
        const result = calculateDeterministicScore(lead);
        const factor = result.factor_breakdown.find(f => f.factor === 'budget');
        expect(factor?.earned_points).toBe(20);
    });

    it('should calculate complete high-intent lead scenario correctly', () => {
        const highIntentLead = {
            moveTimeline: 'asap',             // 35 pts
            preApproval: true,                // 25 pts
            budgetMin: 500000, budgetMax: 600000, // 20 pts (both)
            preferredAreas: ['Downtown'],     // 10 pts
            bedroomsMin: 3, bathroomsMin: 2,  // 5 pts (both)
            source: 'instagram'               // 1 pts (social)
        };
        const result = calculateDeterministicScore(highIntentLead);

        // 35 + 25 + 20 + 10 + 5 + 1 = 96
        expect(result.base_score).toBe(96);

        // Cap test checking
        const result2 = calculateDeterministicScore({ ...highIntentLead, source: 'referral' });
        // 35 + 25 + 20 + 10 + 5 + 5(referral) = 100
        expect(result2.base_score).toBe(100);
    });

    it('should handle zero-intent empty payload correctly', () => {
        const result = calculateDeterministicScore({});
        // Default source is website which is +3 points
        expect(result.base_score).toBe(3);
        expect(result.factor_breakdown.length).toBe(6); // 6 tested factors
    });
});
