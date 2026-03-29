import { prisma } from '@/lib/prisma';
import { processScoreForLead } from './orchestrator';


async function runTest() {
    console.log("=== STARTING AI REASONING SCORING TEST ===");

    try {
        // 1. Seed a fake Lead first
        const mockLead = await prisma.lead.create({
            data: {
                firstName: "AI Testing",
                lastName: "Agent",
                email: "ai.scoring.test." + Date.now() + "@formative.io",
                phone: "555-019-9999",
                budgetMin: 800000,
                preferredAreas: "Downtown, Midtown",
                moveTimeline: "ASAP",
                preApproval: true,
                motivation: "Looking to buy a condo quickly before interest rates go up further.",
                source: "Zillow Testing Unit"
            }
        });

        console.log(`[Test] Created Mock Lead: ${mockLead.id}`);

        // 2. Feed it to the Orchestrator
        console.log(`[Test] Piping Lead into AI Orchestrator...`);
        const result = await processScoreForLead(mockLead.id, mockLead);

        console.log("\n=== FINAL AI LOGIC OUTPUT ===");
        console.log(JSON.stringify(result, null, 2));

    } catch (e) {
        console.error("Test Failed!", e);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();

