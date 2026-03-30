/* scripts/sync-locations.ts */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Location Synchronization ---');

    // 1. Get properties with unique locations
    const properties = await prisma.property.findMany({
        select: { id: true, location: true }
    });
    
    if (properties.length === 0) {
        console.log('No properties found to sync locations from.');
        return;
    }

    // 2. Ensure we have at least one Location Group
    let group = await prisma.locationGroup.findFirst({
        where: { name: 'Main Locations' }
    });

    if (!group) {
        group = await prisma.locationGroup.create({
            data: { name: 'Main Locations' }
        });
        console.log('Created Location Group: "Main Locations"');
    }

    // 3. Create Locations and Link them
    for (const prop of properties) {
        if (!prop.location) continue;

        // Try to find if this location exists
        let loc = await prisma.location.findFirst({
            where: { name: prop.location }
        });

        if (!loc) {
            loc = await prisma.location.create({
                data: {
                    name: prop.location,
                    groupId: group.id
                }
            });
            console.log(`Created Location: "${prop.location}"`);
        }

        // Link the property to the location ID if not already linked
        await prisma.property.update({
            where: { id: prop.id },
            data: { locationId: loc.id }
        });
    }

    console.log('--- Sync Completed Successfully ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
