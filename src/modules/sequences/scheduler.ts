import { prisma } from '@/lib/prisma';
import { executeSequenceStep } from './executor';


export async function runSequenceScheduler() {
    console.log('[Scheduler] Running sequence checks...');

    try {
        // Enforce stop conditions before executing: 
        // 1. Pause sequences for leads that replied or were marked closed
        const leadsToStop = await prisma.lead.findMany({
            where: {
                OR: [
                    { pipelineStage: 'closed' },
                    { emailLogs: { some: { replied: true } } }
                ],
                sequenceStates: { some: { status: 'active' } }
            },
            select: { id: true, emailLogs: { select: { replied: true } } }
        });

        for (const lead of leadsToStop) {
            console.log(`[Scheduler] Pausing sequence for Lead ${lead.id} due to stop conditions (closed or replied).`);
            await prisma.leadSequenceState.updateMany({
                where: { leadId: lead.id, status: 'active' },
                data: { status: 'paused' }
            });
        }

        // Find active sequence states that are due
        const now = new Date();
        const dueStates = await prisma.leadSequenceState.findMany({
            where: {
                status: 'active',
                nextRunAt: { lte: now }
            },
            include: {
                lead: true,
                sequence: {
                    include: { steps: { orderBy: { stepOrder: 'asc' } } }
                }
            }
        });

        console.log(`[Scheduler] Found ${dueStates.length} sequence jobs ready to execute.`);

        for (const state of dueStates) {
            try {
                // Find the step config
                const nextStep = state.sequence.steps.find((s: any) => s.stepOrder === state.currentStep + 1);

                if (!nextStep) {
                    // Sequence reached its end
                    await prisma.leadSequenceState.update({
                        where: { id: state.id },
                        data: { status: 'completed' }
                    });
                    continue;
                }

                // Execute the sequence step via AI logic
                await executeSequenceStep(state.lead, state.sequence, nextStep);

                // Calculate next run date based on the following step (if any)
                const followingStep = state.sequence.steps.find((s: any) => s.stepOrder === state.currentStep + 2);
                
                if (followingStep) {
                    const delayMs = followingStep.delayInDays * 24 * 60 * 60 * 1000;
                    const nextRun = new Date(Date.now() + delayMs);
                    
                    await prisma.leadSequenceState.update({
                        where: { id: state.id },
                        data: {
                            currentStep: nextStep.stepOrder,
                            nextRunAt: nextRun
                        }
                    });
                } else {
                    // No more steps, mark completed
                    await prisma.leadSequenceState.update({
                        where: { id: state.id },
                        data: {
                            currentStep: nextStep.stepOrder,
                            status: 'completed'
                        }
                    });
                }

            } catch (stepErr: any) {
                console.error(`[Scheduler] Error executing sequence step for state ${state.id}`, stepErr.message);
            }
        }
        
        return { success: true, processed: dueStates.length };
    } catch (e: any) {
        console.error('[Scheduler] Critical failure in sequence scheduler:', e.message);
        throw e;
    }
}

