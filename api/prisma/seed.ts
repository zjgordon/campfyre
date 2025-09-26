#!/usr/bin/env tsx

/**
 * Prisma seed file for Campfyre API
 * This file is automatically called by Prisma when running db:seed
 */

import { PrismaClient } from '@prisma/client';
import { getEnvironmentSeedData } from '../src/lib/seedData';

const prisma = new PrismaClient();

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting database seeding...');

  const environment = process.env.NODE_ENV || 'development';
  const seedData = getEnvironmentSeedData(environment);

  console.log(`Environment: ${environment}`);
  console.log(
    `Seeding with ${seedData.users.length} users, ${seedData.campaigns.length} campaigns, ${seedData.characters.length} characters`
  );

  try {
    // Seed game systems first (required for campaigns)
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
    if (seedData.users.length > 0) {
      console.log('Seeding users...');
      for (const user of seedData.users) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: user,
          create: user,
        });
      }
      console.log('✅ Users seeded');
    }

    // Seed campaigns (requires users and game systems)
    if (seedData.campaigns.length > 0) {
      console.log('Seeding campaigns...');

      // Get the first user as owner and first game system
      const owner = await prisma.user.findFirst();
      const gameSystem = await prisma.gameSystem.findFirst();

      if (!owner || !gameSystem) {
        throw new Error('Owner or game system not found for campaign seeding');
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
    }

    // Seed campaign memberships
    if (seedData.campaigns.length > 0 && seedData.users.length > 0) {
      console.log('Seeding campaign memberships...');

      const campaigns = await prisma.campaign.findMany();
      const players = await prisma.user.findMany({
        where: { email: { not: 'gm@campfyre.dev' } }, // Exclude the GM
      });

      for (const campaign of campaigns) {
        for (const player of players.slice(0, campaign.maxPlayers - 1)) {
          // -1 for the owner
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
    }

    // Seed characters (requires users and campaigns)
    if (seedData.characters.length > 0) {
      console.log('Seeding characters...');

      const players = await prisma.user.findMany({
        where: { email: { not: 'gm@campfyre.dev' } },
      });
      const campaigns = await prisma.campaign.findMany();

      for (let i = 0; i < seedData.characters.length; i++) {
        const character = seedData.characters[i];
        const player = players[i % players.length];
        const campaign = campaigns[i % campaigns.length];

        if (!character || !player || !campaign) {
          console.warn(
            `Skipping character ${i}: missing character, player, or campaign`
          );
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
    }

    // Seed game sessions (requires campaigns and users)
    if (seedData.gameSessions.length > 0) {
      console.log('Seeding game sessions...');

      const campaigns = await prisma.campaign.findMany();
      const gms = await prisma.user.findMany({
        where: { email: 'gm@campfyre.dev' },
      });

      if (campaigns.length === 0 || gms.length === 0) {
        console.warn('Skipping game sessions: no campaigns or GMs found');
      } else {
        for (let i = 0; i < seedData.gameSessions.length; i++) {
          const session = seedData.gameSessions[i];
          const campaign = campaigns[i % campaigns.length];
          const gm = gms[0]; // Use the first GM

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
    }

    // Seed messages (requires users and game sessions)
    if (seedData.messages.length > 0) {
      console.log('Seeding messages...');

      const users = await prisma.user.findMany();
      const gameSessions = await prisma.gameSession.findMany();

      if (users.length === 0) {
        console.warn('Skipping messages: no users found');
      } else {
        for (const message of seedData.messages) {
          const author = users[0]; // Use the first user as author
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
    }

    // Seed notifications (requires users)
    if (seedData.notifications.length > 0) {
      console.log('Seeding notifications...');

      const users = await prisma.user.findMany();

      if (users.length === 0) {
        console.warn('Skipping notifications: no users found');
      } else {
        for (const notification of seedData.notifications) {
          const user = users[0]; // Use the first user

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
    }

    console.log('✅ Database seeding completed successfully!');

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

    console.log('\n📊 Seeding Summary:');
    console.log(`- Users: ${counts[0]}`);
    console.log(`- Campaigns: ${counts[1]}`);
    console.log(`- Characters: ${counts[2]}`);
    console.log(`- Game Sessions: ${counts[3]}`);
    console.log(`- Messages: ${counts[4]}`);
    console.log(`- Notifications: ${counts[5]}`);
    console.log(`- Game Systems: ${counts[6]}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
