import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const updated = await prisma.leadCaptureForm.updateMany({
        data: {
            autoSendFirstMessage: true
        }
    });
    console.log(`Updated ${updated.count} forms to autoSendFirstMessage: true`);
}

main().finally(() => prisma.$disconnect());
