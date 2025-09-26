#!/usr/bin/env tsx

/**
 * Database seeding script for Campfyre API
 * Provides development data for testing and development
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed game systems
 */
async function seedGameSystems(): Promise<void> {
  console.log('Seeding game systems...');

  const gameSystems = [
    {
      name: 'Dungeons & Dragons 5th Edition',
      version: '5.0.0',
      description: "The world's most popular tabletop roleplaying game",
      publisher: 'Wizards of the Coast',
      characterSheetTemplate: {
        abilityScores: {
          strength: { value: 10, modifier: 0 },
          dexterity: { value: 10, modifier: 0 },
          constitution: { value: 10, modifier: 0 },
          intelligence: { value: 10, modifier: 0 },
          wisdom: { value: 10, modifier: 0 },
          charisma: { value: 10, modifier: 0 },
        },
        skills: {},
        hitPoints: { current: 0, maximum: 0, temporary: 0 },
        armorClass: 10,
        speed: 30,
        level: 1,
        class: '',
        race: '',
        background: '',
      },
      rules: {
        diceSystem: 'd20',
        abilityScoreGeneration: 'standard_array',
        hitPointRolling: 'average_or_roll',
      },
    },
    {
      name: 'Pathfinder 2nd Edition',
      version: '2.0.0',
      description: 'A fantasy tabletop RPG with deep character customization',
      publisher: 'Paizo Publishing',
      characterSheetTemplate: {
        abilityScores: {
          strength: { value: 10, modifier: 0 },
          dexterity: { value: 10, modifier: 0 },
          constitution: { value: 10, modifier: 0 },
          intelligence: { value: 10, modifier: 0 },
          wisdom: { value: 10, modifier: 0 },
          charisma: { value: 10, modifier: 0 },
        },
        skills: {},
        hitPoints: { current: 0, maximum: 0, temporary: 0 },
        armorClass: 10,
        speed: 25,
        level: 1,
        class: '',
        ancestry: '',
        background: '',
      },
      rules: {
        diceSystem: 'd20',
        abilityScoreGeneration: 'boost_system',
        hitPointRolling: 'class_hp_plus_con',
      },
    },
  ];

  for (const system of gameSystems) {
    await prisma.gameSystem.upsert({
      where: { name: system.name },
      update: system,
      create: system,
    });
  }

  console.log('✅ Game systems seeded');
}

/**
 * Seed development users
 */
async function seedUsers(): Promise<void> {
  console.log('Seeding development users...');

  const users = [
    {
      email: 'gm@campfyre.dev',
      username: 'game_master',
      name: 'Game Master',
      bio: 'The ultimate dungeon master for testing purposes',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en',
      },
    },
    {
      email: 'player1@campfyre.dev',
      username: 'test_player_1',
      name: 'Test Player One',
      bio: 'A test player for development',
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
      },
    },
    {
      email: 'player2@campfyre.dev',
      username: 'test_player_2',
      name: 'Test Player Two',
      bio: 'Another test player for development',
      preferences: {
        theme: 'auto',
        notifications: false,
        language: 'en',
      },
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  console.log('✅ Users seeded');
}

/**
 * Seed development campaigns
 */
async function seedCampaigns(): Promise<void> {
  console.log('Seeding development campaigns...');

  const gm = await prisma.user.findUnique({
    where: { email: 'gm@campfyre.dev' },
  });
  const dndSystem = await prisma.gameSystem.findUnique({
    where: { name: 'Dungeons & Dragons 5th Edition' },
  });

  if (!gm || !dndSystem) {
    console.error(
      '❌ Required users or game systems not found for campaign seeding'
    );
    return;
  }

  const campaigns = [
    {
      name: 'The Lost Mines of Phandelver',
      description: 'A classic D&D adventure perfect for new players and DMs',
      status: 'ACTIVE' as const,
      visibility: 'PRIVATE' as const,
      maxPlayers: 4,
      currentPlayers: 2,
      settings: {
        sessionLength: 180, // 3 hours
        frequency: 'weekly',
        timezone: 'UTC',
      },
      metadata: {
        adventureModule: 'Lost Mines of Phandelver',
        startingLevel: 1,
        expectedLevel: 5,
      },
      ownerId: gm.id,
      gameSystemId: dndSystem.id,
    },
    {
      name: 'Curse of Strahd',
      description: 'A gothic horror adventure in the realm of Barovia',
      status: 'ACTIVE' as const,
      visibility: 'PRIVATE' as const,
      maxPlayers: 6,
      currentPlayers: 4,
      settings: {
        sessionLength: 240, // 4 hours
        frequency: 'bi-weekly',
        timezone: 'UTC',
      },
      metadata: {
        adventureModule: 'Curse of Strahd',
        startingLevel: 1,
        expectedLevel: 10,
      },
      ownerId: gm.id,
      gameSystemId: dndSystem.id,
    },
  ];

  for (const campaign of campaigns) {
    const existingCampaign = await prisma.campaign.findFirst({
      where: { name: campaign.name },
    });

    if (existingCampaign) {
      await prisma.campaign.update({
        where: { id: existingCampaign.id },
        data: campaign,
      });
    } else {
      await prisma.campaign.create({
        data: campaign,
      });
    }
  }

  console.log('✅ Campaigns seeded');
}

/**
 * Seed campaign memberships
 */
async function seedCampaignMembers(): Promise<void> {
  console.log('Seeding campaign memberships...');

  const players = await prisma.user.findMany({
    where: { email: { in: ['player1@campfyre.dev', 'player2@campfyre.dev'] } },
  });

  const campaigns = await prisma.campaign.findMany({
    where: {
      name: { in: ['The Lost Mines of Phandelver', 'Curse of Strahd'] },
    },
  });

  for (const campaign of campaigns) {
    for (const player of players) {
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

/**
 * Seed development characters
 */
async function seedCharacters(): Promise<void> {
  console.log('Seeding development characters...');

  const players = await prisma.user.findMany({
    where: { email: { in: ['player1@campfyre.dev', 'player2@campfyre.dev'] } },
  });

  const campaigns = await prisma.campaign.findMany({
    where: {
      name: { in: ['The Lost Mines of Phandelver', 'Curse of Strahd'] },
    },
  });

  const characters = [
    {
      name: 'Aragorn the Ranger',
      description: 'A skilled ranger from the northern forests',
      level: 3,
      experience: 900,
      characterSheet: {
        abilityScores: {
          strength: { value: 16, modifier: 3 },
          dexterity: { value: 14, modifier: 2 },
          constitution: { value: 13, modifier: 1 },
          intelligence: { value: 12, modifier: 1 },
          wisdom: { value: 15, modifier: 2 },
          charisma: { value: 10, modifier: 0 },
        },
        class: 'Ranger',
        race: 'Human',
        background: 'Folk Hero',
        hitPoints: { current: 28, maximum: 28, temporary: 0 },
        armorClass: 14,
        speed: 30,
      },
    },
    {
      name: 'Gandalf the Wizard',
      description: 'A wise wizard with a staff and a pointy hat',
      level: 5,
      experience: 2400,
      characterSheet: {
        abilityScores: {
          strength: { value: 8, modifier: -1 },
          dexterity: { value: 12, modifier: 1 },
          constitution: { value: 14, modifier: 2 },
          intelligence: { value: 18, modifier: 4 },
          wisdom: { value: 16, modifier: 3 },
          charisma: { value: 13, modifier: 1 },
        },
        class: 'Wizard',
        race: 'Human',
        background: 'Sage',
        hitPoints: { current: 32, maximum: 32, temporary: 0 },
        armorClass: 12,
        speed: 30,
      },
    },
  ];

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
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

/**
 * Clear all seeded data
 */
async function clearSeededData(): Promise<void> {
  console.log('Clearing seeded data...');

  // Delete in reverse order of dependencies
  await prisma.character.deleteMany({
    where: {
      owner: {
        email: {
          in: [
            'gm@campfyre.dev',
            'player1@campfyre.dev',
            'player2@campfyre.dev',
          ],
        },
      },
    },
  });

  await prisma.campaignMember.deleteMany({
    where: {
      user: {
        email: {
          in: [
            'gm@campfyre.dev',
            'player1@campfyre.dev',
            'player2@campfyre.dev',
          ],
        },
      },
    },
  });

  await prisma.campaign.deleteMany({
    where: {
      name: { in: ['The Lost Mines of Phandelver', 'Curse of Strahd'] },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['gm@campfyre.dev', 'player1@campfyre.dev', 'player2@campfyre.dev'],
      },
    },
  });

  await prisma.gameSystem.deleteMany({
    where: {
      name: {
        in: ['Dungeons & Dragons 5th Edition', 'Pathfinder 2nd Edition'],
      },
    },
  });

  console.log('✅ Seeded data cleared');
}

/**
 * Main seeding function
 */
async function seed(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');

    await seedGameSystems();
    await seedUsers();
    await seedCampaigns();
    await seedCampaignMembers();
    await seedCharacters();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const shouldReset = args.includes('--reset');

  if (shouldReset) {
    await clearSeededData();
  }

  await seed();
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}
