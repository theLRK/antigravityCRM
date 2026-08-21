import { prisma } from '@/lib/prisma';
import { runLLMScoring } from './llm/adjuster';
import { dispatchWelcomeEmail } from '@/modules/email/dispatcher';
import { runPropertyMatchingForLead } from './matching';
import { bus } from '@/events/bus';
import { env } from '@/config/env';


export async function processScoreForLead(leadId: string, leadData: any) {
    try {
        console.log(`[LeadPipeline] ─────────────────────────────────────────`);
        console.log(`[LeadPipeline] Processing Lead ID: ${leadId}`);
        console.log(`[LeadPipeline] Lead: ${leadData.firstName} ${leadData.lastName} <${leadData.email}>`);

        // Log pipeline start
        await prisma.activityLog.create({
            data: { leadId, eventType: 'pipeline_started', metadata: JSON.stringify({ pipeline: 'scoring_and_email' }) }
        });

        // ── Step 1: Deterministic Multi-Factor Base Score (0 to 85) ──────
        let baseScore = 0;

        // 1. Timeline scoring (Max 30 pts)
        const timeline = (leadData.timeline || leadData.moveTimeline || '').toLowerCase();
        if (timeline.includes('immediately') || timeline.includes('asap') || timeline === 'asap') {
            baseScore += 30;
        } else if (timeline.includes('1_month') || timeline.includes('1 month') || timeline.includes('1-2')) {
            baseScore += 24;
        } else if (timeline.includes('3_months') || timeline.includes('1-3') || timeline.includes('1 to 3')) {
            baseScore += 18;
        } else if (timeline.includes('3-6') || timeline.includes('3 to 6')) {
            baseScore += 10;
        } else if (timeline.includes('6+') || timeline.includes('6_plus') || timeline.includes('just looking') || timeline.includes('just_looking')) {
            baseScore += 3;
        } else {
            baseScore += 12; // Unspecified default
        }

        // 2. Financing scoring (Max 25 pts)
        const financing = (leadData.financingStatus || leadData.financing || '').toLowerCase();
        const isPreApproved = leadData.preApproval === true || financing.includes('pre_approved') || financing.includes('pre-approved');
        if (financing.includes('cash')) {
            baseScore += 25;
        } else if (isPreApproved) {
            baseScore += 22;
        } else if (financing.includes('needs_lender') || financing.includes('needs lender') || financing.includes('in_progress')) {
            baseScore += 12;
        } else if (financing.includes('just_looking') || financing.includes('just looking')) {
            baseScore += 3;
        } else {
            baseScore += 10; // Unspecified
        }

        // 3. Budget Specificity (Max 15 pts)
        const bMin = Number(leadData.budgetMin) || 0;
        const bMax = Number(leadData.budgetMax) || 0;
        if (bMin > 0 && bMax > 0) {
            baseScore += 15;
        } else if (bMin > 0 || bMax > 0) {
            baseScore += 10;
        } else {
            baseScore += 4;
        }

        // 4. Location & Active Inventory Alignment (Max 15 pts)
        let hasLocation = false;
        let hasPropertiesInArea = false;

        const leadDetails = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { notes: true }
        });

        if (leadDetails) {
            const locIds = Array.isArray(leadDetails.preferredLocationIds) ? (leadDetails.preferredLocationIds as string[]) : [];
            const hasLegacyArea = !!(leadDetails.preferredAreas && leadDetails.preferredAreas.trim() !== '');
            const hasCustomLoc = !!(leadDetails.customLocation && leadDetails.customLocation.trim() !== '');

            if (locIds.length > 0 || hasLegacyArea || hasCustomLoc) {
                hasLocation = true;
                baseScore += 8;
            }

            if (locIds.length > 0) {
                const propertyCount = await prisma.property.count({
                    where: { locationId: { in: locIds }, status: 'Available' }
                });
                if (propertyCount > 0) {
                    hasPropertiesInArea = true;
                    baseScore += 7;
                }
            } else if (hasLegacyArea) {
                const propertyCount = await prisma.property.count({
                    where: { location: { contains: leadDetails.preferredAreas! }, status: 'Available' }
                });
                if (propertyCount > 0) {
                    hasPropertiesInArea = true;
                    baseScore += 7;
                }
            }
        }

        // 5. Source Quality (Max 5 pts)
        const source = (leadData.source || '').toLowerCase();
        if (source.includes('referral') || source.includes('vip')) baseScore += 5;
        else if (source.includes('website') || source.includes('direct')) baseScore += 4;
        else baseScore += 2;

        baseScore = Math.min(Math.max(baseScore, 0), 85);
        console.log(`[LeadPipeline] Deterministic score calculated: ${baseScore}`);

        await prisma.activityLog.create({
            data: { leadId, eventType: 'deterministic_score_calculated', metadata: JSON.stringify({ baseScore }) }
        });

        // ── Step 2: LLM Qualitative Notes & Intent Adjustment (Google Gemini) ─────
        console.log(`[LeadPipeline] Running Gemini LLM scoring...`);
        let llmAdjustment = 0;
        let llmReason = 'Evaluated based on client parameters.';

        // Combine motivation and agent notes for deep evaluation
        const leadNotesList = leadDetails?.notes ? leadDetails.notes.map(n => n.content).filter(Boolean) : [];
        const combinedNotes = [leadData.motivation, ...leadNotesList].filter(Boolean).join('; ');

        try {
            const llmResult = await runLLMScoring({
                timeline: leadData.timeline || leadData.moveTimeline || 'Unknown',
                financing_status: leadData.financingStatus || leadData.financing || 'Unknown',
                budget_range: leadData.budgetMin && leadData.budgetMax
                    ? `$${leadData.budgetMin} - $${leadData.budgetMax}`
                    : leadData.budgetMax ? `Up to $${leadData.budgetMax}` : 'Unknown',
                motivation: leadData.motivation || undefined,
                notes: combinedNotes || undefined,
                source: leadData.source || undefined
            });

            llmAdjustment = llmResult.adjustment;
            llmReason = llmResult.reason;
            console.log(`[LeadPipeline] Gemini scoring completed. Adjustment: ${llmAdjustment}, Reason: ${llmReason}`);

            await prisma.activityLog.create({
                data: { leadId, eventType: 'llm_scoring_success', metadata: JSON.stringify({ adjustment: llmAdjustment, reason: llmReason }) }
            });

        } catch (llmError: any) {
            console.error(`[LeadPipeline] LLM scoring threw an error: ${llmError.message}. Continuing with base score.`);
            llmAdjustment = 0;
            llmReason = 'Calculated based on verified lead criteria.';
        }

        // ── Step 3: Final Score Calculation (Guaranteed) ─────────────────
        const finalScore = Math.min(Math.max(baseScore + llmAdjustment, 0), 100);
        const likelihoodLabel = finalScore >= 75 ? 'Hot' : finalScore >= 40 ? 'Warm' : 'Cold';
        const confidenceScore = Math.round(50 + (finalScore / 2));
        const confidenceLevel = confidenceScore >= 80 ? 'High' : confidenceScore >= 60 ? 'Medium' : 'Low';
        const suggestedAction = finalScore >= 75
            ? 'Call immediately — high intent buyer'
            : finalScore >= 40
                ? 'Send personalized market report and follow up within 48hrs'
                : 'Add to automated long-term nurture campaign';

        console.log(`[LeadPipeline] Final score: ${finalScore} (Base: ${baseScore} + LLM: ${llmAdjustment})`);
        console.log(`[LeadPipeline] Lead tier: ${likelihoodLabel} | Confidence: ${confidenceLevel}`);
        console.log(`[LeadPipeline] Suggested action: ${suggestedAction}`);

        // ── Step 4: Save to Database (Guaranteed) ────────────────────────
        const scoreRecord = await prisma.score.create({
            data: {
                leadId,
                baseScore,
                llmDelta: llmAdjustment,
                finalScore,
                likelihoodLabel,
                confidenceScore,
                confidenceLevel,
                suggestedAction,
                llmUsed: llmAdjustment !== 0,
                llmModel: 'gemini-2.0-flash',
                reasoningBreakdowns: {
                    create: {
                        deterministicFactors: JSON.stringify({
                            timeline: timeline || 'unknown',
                            financing: financing || 'unknown',
                            source: source || 'unknown',
                            hasLocation,
                            hasPropertiesInArea,
                            baseScore
                        }),
                        llmReasoning: llmReason,
                        llmSuggestedAction: suggestedAction,
                        llmConfidenceNote: `LLM applied ${llmAdjustment > 0 ? '+' : ''}${llmAdjustment} point adjustment.`,
                        reasoningSummary: llmReason
                    }
                }
            },
            include: { reasoningBreakdowns: true }
        });

        // Update lead with confidence metadata
        await prisma.lead.update({
            where: { id: leadId },
            data: { confidenceScore, confidenceLevel, pipelineStage: 'scored' }
        });

        await prisma.activityLog.create({
            data: { leadId, eventType: 'score_saved', metadata: JSON.stringify({ finalScore, label: likelihoodLabel }) }
        });
        console.log(`[LeadPipeline] Score record saved to database.`);

        // ── 4.5 Trigger Property Matching ──────────────────────────────────
        console.log(`[LeadPipeline] Triggering Property Matching for Lead AI Results...`);
        try {
            await runPropertyMatchingForLead(leadId);
        } catch (matchErr: any) {
            console.error(`[LeadPipeline] Property Matcher failed, continuing: ${matchErr?.message || matchErr}`);
        }

        // ── Step 5: Automated AI Email Dispatch ─────────────────────────
        console.log(`[LeadPipeline] Triggering Automated Welcome Email for Lead ${leadId}...`);
        try {
            await dispatchWelcomeEmail(leadId);
        } catch (emailErr: any) {
            console.error(`[LeadPipeline] Email dispatch error (non-fatal):`, emailErr?.message || emailErr);
        }

        // Emit Event for any auxiliary listeners
        try {
            bus.emit('lead.scored', {
                leadId,
                scoreId: scoreRecord.id,
                finalScore,
                likelihoodLabel,
                confidenceLevel,
                suggestedAction
            });
        } catch (_) {}

        console.log(`[LeadPipeline] ✅ Pipeline complete for Lead ${leadId}`);
        console.log(`[LeadPipeline] ─────────────────────────────────────────`);

        return scoreRecord;

    } catch (error: any) {
        console.error(`[LeadPipeline] ❌ Pipeline failed for Lead ${leadId}:`, error.message || error);

        // Final fallback log if the whole pipeline crashes critically (e.g. database disconnect)
        try {
            await prisma.activityLog.create({
                data: { leadId, eventType: 'pipeline_failed_critically', isError: true, errorMessage: error.message || String(error) }
            });
        } catch (_) { } // ignore if DB is truly down

        // Still throw to let the caller handle it (event bus)
        throw error;
    }
}

