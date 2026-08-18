import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("=== CHECKING RECENT LEADS ===");
    const leads = await prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            scores: true,
            emailLogs: true,
            activityLogs: true,
            sourceForm: true
        }
    });

    console.log(`Found ${leads.length} recent leads:`);
    for (const l of leads) {
        console.log(`\nLead: ${l.firstName} ${l.lastName} (${l.email}) - Created: ${l.createdAt}`);
        console.log(`  Form ID: ${l.formId} (AutoSend: ${l.sourceForm?.autoSendFirstMessage})`);
        console.log(`  Scores:`, l.scores.map(s => `Score: ${s.finalScore}, Label: ${s.likelihoodLabel}`));
        console.log(`  Email Logs:`, l.emailLogs.map(e => `Status: ${e.status}, Subject: ${e.subjectLine}, SentAt: ${e.sentAt}`));
        console.log(`  Activity Logs:`, l.activityLogs.map(a => a.eventType));
    }

    console.log("\n=== CHECKING AGENT PROFILES ===");
    const profiles = await prisma.agentProfile.findMany();
    console.log(profiles.map(p => ({
        agentId: p.agentId,
        name: p.name,
        gmailEmailAddress: p.gmailEmailAddress,
        hasAppPassword: !!p.gmailAppPassword,
        emailFromName: p.emailFromName
    })));

    console.log("\n=== CHECKING LEAD CAPTURE FORMS ===");
    const forms = await prisma.leadCaptureForm.findMany();
    console.log(forms.map(f => ({
        id: f.id,
        title: f.title,
        isActive: f.isActive,
        autoSendFirstMessage: f.autoSendFirstMessage,
        agentId: f.agentId
    })));
}

main().finally(() => prisma.$disconnect());
