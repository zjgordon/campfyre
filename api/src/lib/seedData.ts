/**
 * Seed data library for Campfyre API
 * Provides realistic development data for all entities
 */

export interface SeedDataOptions {
  environment: 'development' | 'test' | 'staging';
  dataSize: 'small' | 'medium' | 'large';
  includeUsers: boolean;
  includeCampaigns: boolean;
  includeCharacters: boolean;
  includeSessions: boolean;
}

export const defaultSeedOptions: SeedDataOptions = {
  environment: 'development',
  dataSize: 'medium',
  includeUsers: true,
  includeCampaigns: true,
  includeCharacters: true,
  includeSessions: true,
};

/**
 * Game Systems seed data
 */
export const gameSystemsData = [
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
  {
    name: 'Call of Cthulhu 7th Edition',
    version: '7.0.0',
    description: 'Horror roleplaying in the world of H.P. Lovecraft',
    publisher: 'Chaosium',
    characterSheetTemplate: {
      characteristics: {
        strength: { value: 50, modifier: 0 },
        constitution: { value: 50, modifier: 0 },
        power: { value: 50, modifier: 0 },
        dexterity: { value: 50, modifier: 0 },
        appearance: { value: 50, modifier: 0 },
        size: { value: 50, modifier: 0 },
        intelligence: { value: 50, modifier: 0 },
        education: { value: 50, modifier: 0 },
      },
      skills: {},
      hitPoints: { current: 0, maximum: 0 },
      magicPoints: { current: 0, maximum: 0 },
      sanity: { current: 0, maximum: 0 },
    },
    rules: {
      diceSystem: 'd100',
      abilityScoreGeneration: '3d6_times_5',
      hitPointRolling: 'constitution_plus_size',
    },
  },
  {
    name: 'Vampire: The Masquerade 5th Edition',
    version: '5.0.0',
    description: 'Modern gothic horror roleplaying',
    publisher: 'White Wolf Publishing',
    characterSheetTemplate: {
      attributes: {
        physical: {
          strength: { value: 1, modifier: 0 },
          dexterity: { value: 1, modifier: 0 },
          stamina: { value: 1, modifier: 0 },
        },
        social: {
          charisma: { value: 1, modifier: 0 },
          manipulation: { value: 1, modifier: 0 },
          composure: { value: 1, modifier: 0 },
        },
        mental: {
          intelligence: { value: 1, modifier: 0 },
          wits: { value: 1, modifier: 0 },
          resolve: { value: 1, modifier: 0 },
        },
      },
      skills: {},
      health: { current: 0, maximum: 0 },
      willpower: { current: 0, maximum: 0 },
      humanity: { current: 0, maximum: 0 },
    },
    rules: {
      diceSystem: 'd10',
      abilityScoreGeneration: 'point_buy',
      hitPointRolling: 'stamina_plus_3',
    },
  },
];

/**
 * Users seed data
 */
export const usersData = [
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
  {
    email: 'alice@campfyre.dev',
    username: 'alice_gm',
    name: 'Alice the GM',
    bio: 'Experienced GM with a passion for storytelling',
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en',
    },
  },
  {
    email: 'bob@campfyre.dev',
    username: 'bob_player',
    name: 'Bob the Player',
    bio: 'Enthusiastic player who loves character development',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en',
    },
  },
  {
    email: 'charlie@campfyre.dev',
    username: 'charlie_dm',
    name: 'Charlie the DM',
    bio: 'Creative DM with a focus on player agency',
    preferences: {
      theme: 'auto',
      notifications: true,
      language: 'en',
    },
  },
];

/**
 * Campaigns seed data
 */
export const campaignsData = [
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
  },
  {
    name: 'Waterdeep: Dragon Heist',
    description: 'A treasure hunt in the City of Splendors',
    status: 'ACTIVE' as const,
    visibility: 'PUBLIC' as const,
    maxPlayers: 5,
    currentPlayers: 3,
    settings: {
      sessionLength: 210, // 3.5 hours
      frequency: 'weekly',
      timezone: 'UTC',
    },
    metadata: {
      adventureModule: 'Waterdeep: Dragon Heist',
      startingLevel: 1,
      expectedLevel: 5,
    },
  },
  {
    name: 'The Call of Cthulhu Investigation',
    description: 'A horror investigation in 1920s New England',
    status: 'ACTIVE' as const,
    visibility: 'PRIVATE' as const,
    maxPlayers: 4,
    currentPlayers: 3,
    settings: {
      sessionLength: 180,
      frequency: 'monthly',
      timezone: 'UTC',
    },
    metadata: {
      adventureModule: 'Custom Investigation',
      startingLevel: 0,
      expectedLevel: 0,
    },
  },
];

/**
 * Characters seed data
 */
export const charactersData = [
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
  {
    name: 'Legolas the Archer',
    description: 'An elven archer with unmatched precision',
    level: 4,
    experience: 1800,
    characterSheet: {
      abilityScores: {
        strength: { value: 12, modifier: 1 },
        dexterity: { value: 18, modifier: 4 },
        constitution: { value: 14, modifier: 2 },
        intelligence: { value: 13, modifier: 1 },
        wisdom: { value: 15, modifier: 2 },
        charisma: { value: 11, modifier: 0 },
      },
      class: 'Fighter',
      race: 'Elf',
      background: 'Noble',
      hitPoints: { current: 36, maximum: 36, temporary: 0 },
      armorClass: 16,
      speed: 35,
    },
  },
  {
    name: 'Gimli the Dwarf',
    description: 'A stout dwarf warrior with a mighty axe',
    level: 4,
    experience: 1800,
    characterSheet: {
      abilityScores: {
        strength: { value: 17, modifier: 3 },
        dexterity: { value: 10, modifier: 0 },
        constitution: { value: 16, modifier: 3 },
        intelligence: { value: 11, modifier: 0 },
        wisdom: { value: 13, modifier: 1 },
        charisma: { value: 12, modifier: 1 },
      },
      class: 'Fighter',
      race: 'Dwarf',
      background: 'Soldier',
      hitPoints: { current: 40, maximum: 40, temporary: 0 },
      armorClass: 18,
      speed: 25,
    },
  },
];

/**
 * Game Sessions seed data
 */
export const gameSessionsData = [
  {
    name: 'Session 1: The Goblin Ambush',
    description: 'The party encounters goblins on the road to Phandalin',
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    status: 'PLANNED' as const,
    settings: {
      allowSpectators: false,
      recordSession: true,
      enableVoiceChat: true,
      diceRollVisibility: 'public',
    },
    notes: 'First session - introduce the party and begin the adventure',
  },
  {
    name: 'Session 2: The Redbrand Hideout',
    description: 'The party investigates the Redbrands in Phandalin',
    scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    status: 'PLANNED' as const,
    settings: {
      allowSpectators: false,
      recordSession: true,
      enableVoiceChat: true,
      diceRollVisibility: 'public',
    },
    notes: 'Combat-heavy session - prepare for tactical encounters',
  },
  {
    name: 'Session 3: The Cragmaw Castle',
    description: 'The party assaults the goblin stronghold',
    scheduledAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    status: 'PLANNED' as const,
    settings: {
      allowSpectators: false,
      recordSession: true,
      enableVoiceChat: true,
      diceRollVisibility: 'public',
    },
    notes: 'Major combat encounter - boss fight with King Grol',
  },
];

/**
 * Messages seed data
 */
export const messagesData = [
  {
    content: 'Welcome to the Lost Mines of Phandelver!',
    type: 'GM_ANNOUNCEMENT' as const,
    metadata: {
      systemMessage: {
        type: 'join',
        data: { campaignId: 'campaign-1' },
      },
    },
  },
  {
    content: 'I roll for initiative!',
    type: 'DICE_ROLL' as const,
    metadata: {
      diceRolls: [
        {
          expression: '1d20+3',
          result: 17,
          rolls: [14],
        },
      ],
    },
  },
  {
    content: 'My character attacks the goblin with his sword',
    type: 'CHARACTER_ACTION' as const,
    metadata: {
      characterAction: {
        characterId: 'character-1',
        action: 'attack',
        target: 'goblin',
      },
    },
  },
];

/**
 * Notifications seed data
 */
export const notificationsData = [
  {
    title: 'New Campaign Invitation',
    content: 'You have been invited to join "The Lost Mines of Phandelver"',
    type: 'CAMPAIGN_INVITE' as const,
    metadata: {
      campaignId: 'campaign-1',
      priority: 'medium',
    },
  },
  {
    title: 'Session Reminder',
    content:
      'Your next session "The Goblin Ambush" is scheduled for tomorrow at 7 PM',
    type: 'SESSION_REMINDER' as const,
    metadata: {
      gameSessionId: 'session-1',
      priority: 'high',
    },
  },
  {
    title: 'Character Update',
    content: 'Your character Aragorn has gained 100 experience points',
    type: 'CAMPAIGN_UPDATE' as const,
    metadata: {
      characterId: 'character-1',
      priority: 'low',
    },
  },
];

/**
 * Get seed data based on options
 */
export function getSeedData(options: Partial<SeedDataOptions> = {}) {
  const opts = { ...defaultSeedOptions, ...options };

  return {
    gameSystems: gameSystemsData,
    users: opts.includeUsers ? usersData : [],
    campaigns: opts.includeCampaigns ? campaignsData : [],
    characters: opts.includeCharacters ? charactersData : [],
    gameSessions: opts.includeSessions ? gameSessionsData : [],
    messages: opts.includeSessions ? messagesData : [],
    notifications: opts.includeUsers ? notificationsData : [],
  };
}

/**
 * Get environment-specific seed data
 */
export function getEnvironmentSeedData(environment: string) {
  switch (environment) {
    case 'test':
      return getSeedData({
        environment: 'test',
        dataSize: 'small',
        includeUsers: true,
        includeCampaigns: true,
        includeCharacters: true,
        includeSessions: false,
      });
    case 'staging':
      return getSeedData({
        environment: 'staging',
        dataSize: 'medium',
        includeUsers: true,
        includeCampaigns: true,
        includeCharacters: true,
        includeSessions: true,
      });
    case 'development':
    default:
      return getSeedData({
        environment: 'development',
        dataSize: 'medium',
        includeUsers: true,
        includeCampaigns: true,
        includeCharacters: true,
        includeSessions: true,
      });
  }
}
