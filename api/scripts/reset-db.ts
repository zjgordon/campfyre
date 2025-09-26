#!/usr/bin/env tsx

/**
 * Database reset script for Campfyre API
 * Provides options to reset and reseed the database
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

/**
 * Reset database using Prisma migrate reset
 */
async function resetDatabase(): Promise<void> {
  console.log('🔄 Resetting database with Prisma migrate reset...');

  try {
    // Use Prisma's built-in reset command
    execSync('npx prisma migrate reset --force', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

/**
 * Clear all data manually (alternative to migrate reset)
 */
async function clearAllData(): Promise<void> {
  console.log('🧹 Clearing all data manually...');

  try {
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

    console.log('✅ All data cleared');
  } catch (error) {
    console.error('❌ Data clearing failed:', error);
    throw error;
  }
}

/**
 * Reseed database after reset
 */
async function reseedDatabase(): Promise<void> {
  console.log('🌱 Reseeding database...');

  try {
    // Run the seed script
    execSync('npx tsx prisma/seed.ts', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('✅ Database reseeded');
  } catch (error) {
    console.error('❌ Database reseeding failed:', error);
    throw error;
  }
}

/**
 * Show current database status
 */
async function showDatabaseStatus(): Promise<void> {
  console.log('📊 Current database status:');

  try {
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.character.count(),
      prisma.gameSession.count(),
      prisma.message.count(),
      prisma.notification.count(),
      prisma.gameSystem.count(),
    ]);

    console.log(`- Users: ${counts[0]}`);
    console.log(`- Campaigns: ${counts[1]}`);
    console.log(`- Characters: ${counts[2]}`);
    console.log(`- Game Sessions: ${counts[3]}`);
    console.log(`- Messages: ${counts[4]}`);
    console.log(`- Notifications: ${counts[5]}`);
    console.log(`- Game Systems: ${counts[6]}`);
  } catch (error) {
    console.error('❌ Failed to get database status:', error);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'reset':
        await resetDatabase();
        if (args.includes('--seed')) {
          await reseedDatabase();
        }
        break;

      case 'clear':
        await clearAllData();
        if (args.includes('--seed')) {
          await reseedDatabase();
        }
        break;

      case 'seed':
        await reseedDatabase();
        break;

      case 'status':
        await showDatabaseStatus();
        break;

      default:
        console.log('Usage: tsx scripts/reset-db.ts <command> [options]');
        console.log('');
        console.log('Commands:');
        console.log('  reset     Reset database using Prisma migrate reset');
        console.log('  clear     Clear all data manually');
        console.log('  seed      Reseed database with development data');
        console.log('  status    Show current database status');
        console.log('');
        console.log('Options:');
        console.log('  --seed    Also reseed after reset/clear');
        console.log('');
        console.log('Examples:');
        console.log('  tsx scripts/reset-db.ts reset --seed');
        console.log('  tsx scripts/reset-db.ts clear');
        console.log('  tsx scripts/reset-db.ts status');
        break;
    }
  } catch (error) {
    console.error('Reset script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
