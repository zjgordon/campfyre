#!/usr/bin/env tsx

/**
 * Development seed script for Campfyre API
 * Provides comprehensive development data for local development
 */

import { PrismaClient } from '@prisma/client';
import { getEnvironmentSeedData } from '../src/lib/seedData';

const prisma = new PrismaClient();

/**
 * Clear all existing data
 */
async function clearDatabase(): Promise<void> {
  console.log('🧹 Clearing existing data...');

  // Delete in reverse order of dependencies
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.gameSessionCharacter.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.character.deleteMany();
  await prisma.campaignMember.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.gameSystem.deleteMany();

  console.log('✅ Database cleared');
}

/**
 * Seed development data
 */
async function seedDevelopmentData(): Promise<void> {
  console.log('🌱 Seeding development data...');

  const seedData = getEnvironmentSeedData('development');

  try {
    // Seed game systems
    console.log('Seeding game systems...');
    for (const system of seedData.gameSystems) {
      await prisma.gameSystem.upsert({
        where: { name: system.name },
        update: system,
        create: system,
      });
    }
    console.log('✅ Game systems seeded');

    // Seed users
    console.log('Seeding users...');
    for (const user of seedData.users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user,
      });
    }
    console.log('✅ Users seeded');

    // Seed campaigns
    console.log('Seeding campaigns...');
    const owner = await prisma.user.findFirst();
    const gameSystem = await prisma.gameSystem.findFirst();

    if (!owner || !gameSystem) {
      throw new Error('Owner or game system not found');
    }

    for (const campaign of seedData.campaigns) {
      const existingCampaign = await prisma.campaign.findFirst({
        where: { name: campaign.name },
      });

      if (existingCampaign) {
        await prisma.campaign.update({
          where: { id: existingCampaign.id },
          data: {
            ...campaign,
            ownerId: owner.id,
            gameSystemId: gameSystem.id,
          },
        });
      } else {
        await prisma.campaign.create({
          data: {
            ...campaign,
            ownerId: owner.id,
            gameSystemId: gameSystem.id,
          },
        });
      }
    }
    console.log('✅ Campaigns seeded');

    // Seed campaign memberships
    console.log('Seeding campaign memberships...');
    const campaigns = await prisma.campaign.findMany();
    const players = await prisma.user.findMany({
      where: { email: { not: 'gm@campfyre.dev' } },
    });

    for (const campaign of campaigns) {
      for (const player of players.slice(0, campaign.maxPlayers - 1)) {
        await prisma.campaignMember.upsert({
          where: {
            userId_campaignId: {
              userId: player.id,
              campaignId: campaign.id,
            },
          },
          update: {},
          create: {
            userId: player.id,
            campaignId: campaign.id,
            role: 'PLAYER' as const,
          },
        });
      }
    }
    console.log('✅ Campaign memberships seeded');

    // Seed characters
    console.log('Seeding characters...');
    for (let i = 0; i < seedData.characters.length; i++) {
      const character = seedData.characters[i];
      const player = players[i % players.length];
      const campaign = campaigns[i % campaigns.length];

      if (!character || !player || !campaign) {
        console.warn(`Skipping character ${i}: missing data`);
        continue;
      }

      const existingCharacter = await prisma.character.findFirst({
        where: {
          name: character.name,
          ownerId: player.id,
        },
      });

      if (existingCharacter) {
        await prisma.character.update({
          where: { id: existingCharacter.id },
          data: {
            name: character.name,
            description: character.description,
            level: character.level,
            experience: character.experience,
            characterSheet: character.characterSheet,
            ownerId: player.id,
            campaignId: campaign.id,
          },
        });
      } else {
        await prisma.character.create({
          data: {
            name: character.name,
            description: character.description,
            level: character.level,
            experience: character.experience,
            characterSheet: character.characterSheet,
            ownerId: player.id,
            campaignId: campaign.id,
          },
        });
      }
    }
    console.log('✅ Characters seeded');

    // Seed game sessions
    console.log('Seeding game sessions...');
    const gms = await prisma.user.findMany({
      where: { email: 'gm@campfyre.dev' },
    });

    if (gms.length > 0) {
      for (let i = 0; i < seedData.gameSessions.length; i++) {
        const session = seedData.gameSessions[i];
        const campaign = campaigns[i % campaigns.length];
        const gm = gms[0];

        if (!session || !campaign || !gm) {
          console.warn(
            `Skipping session ${i}: missing session, campaign, or GM`
          );
          continue;
        }

        const existingSession = await prisma.gameSession.findFirst({
          where: { name: session.name },
        });

        if (existingSession) {
          await prisma.gameSession.update({
            where: { id: existingSession.id },
            data: {
              name: session.name,
              description: session.description,
              scheduledAt: session.scheduledAt,
              status: session.status,
              settings: session.settings,
              notes: session.notes,
              campaignId: campaign.id,
              gmId: gm.id,
            },
          });
        } else {
          await prisma.gameSession.create({
            data: {
              name: session.name,
              description: session.description,
              scheduledAt: session.scheduledAt,
              status: session.status,
              settings: session.settings,
              notes: session.notes,
              campaignId: campaign.id,
              gmId: gm.id,
            },
          });
        }
      }
      console.log('✅ Game sessions seeded');
    }

    // Seed messages
    console.log('Seeding messages...');
    const users = await prisma.user.findMany();
    const gameSessions = await prisma.gameSession.findMany();

    if (users.length > 0) {
      for (const message of seedData.messages) {
        const author = users[0];
        const gameSession = gameSessions.length > 0 ? gameSessions[0] : null;

        if (!author) {
          console.warn('Skipping message: no author found');
          continue;
        }

        await prisma.message.create({
          data: {
            content: message.content,
            type: message.type,
            metadata: message.metadata,
            authorId: author.id,
            gameSessionId: gameSession?.id || null,
          },
        });
      }
      console.log('✅ Messages seeded');
    }

    // Seed notifications
    console.log('Seeding notifications...');
    if (users.length > 0) {
      for (const notification of seedData.notifications) {
        const user = users[0];

        if (!user) {
          console.warn('Skipping notification: no user found');
          continue;
        }

        await prisma.notification.create({
          data: {
            title: notification.title,
            content: notification.content,
            type: notification.type,
            metadata: notification.metadata,
            userId: user.id,
          },
        });
      }
      console.log('✅ Notifications seeded');
    }

    console.log('✅ Development data seeding completed!');
  } catch (error) {
    console.error('❌ Development seeding failed:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear') || args.includes('-c');

  try {
    if (shouldClear) {
      await clearDatabase();
    }

    await seedDevelopmentData();

    // Print summary
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.character.count(),
      prisma.gameSession.count(),
      prisma.message.count(),
      prisma.notification.count(),
      prisma.gameSystem.count(),
    ]);

    console.log('\n📊 Development Data Summary:');
    console.log(`- Users: ${counts[0]}`);
    console.log(`- Campaigns: ${counts[1]}`);
    console.log(`- Characters: ${counts[2]}`);
    console.log(`- Game Sessions: ${counts[3]}`);
    console.log(`- Messages: ${counts[4]}`);
    console.log(`- Notifications: ${counts[5]}`);
    console.log(`- Game Systems: ${counts[6]}`);
  } catch (error) {
    console.error('Development seed script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
