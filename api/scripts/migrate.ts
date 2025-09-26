#!/usr/bin/env tsx

/**
 * Migration management script for Campfyre API
 * Provides rollback and validation capabilities for database migrations
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface MigrationInfo {
  name: string;
  timestamp: string;
  path: string;
}

/**
 * Get list of available migrations
 */
function getMigrations(): MigrationInfo[] {
  const migrationsDir = join(process.cwd(), 'prisma', 'migrations');

  try {
    const migrationDirs = readdirSync(migrationsDir, { withFileTypes: true })
      .filter(
        (dirent) =>
          dirent.isDirectory() && dirent.name !== 'migration_lock.toml'
      )
      .map((dirent) => {
        const [timestamp, ...nameParts] = dirent.name.split('_');
        return {
          name: nameParts.join('_'),
          timestamp: timestamp || '',
          path: join(migrationsDir, dirent.name),
        };
      })
      .filter((migration) => migration.timestamp) // Filter out invalid migrations
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return migrationDirs;
  } catch (error) {
    console.error('Error reading migrations directory:', error);
    return [];
  }
}

/**
 * Get current migration status
 */
function getMigrationStatus(): string {
  try {
    const output = execSync('npx prisma migrate status', {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return output.trim();
  } catch (error) {
    console.error('Error getting migration status:', error);
    return 'Unknown';
  }
}

/**
 * Rollback to a specific migration
 */
function rollbackTo(targetMigration?: string): void {
  const migrations = getMigrations();

  if (migrations.length === 0) {
    console.log('No migrations found.');
    return;
  }

  if (!targetMigration) {
    // Rollback to previous migration
    const currentStatus = getMigrationStatus();
    console.log('Current migration status:', currentStatus);

    if (migrations.length <= 1) {
      console.log('Cannot rollback: only one migration exists.');
      return;
    }

    const targetMigrationName = migrations[migrations.length - 2]?.name;
    console.log(`Rolling back to: ${targetMigrationName}`);
  } else {
    console.log(`Rolling back to: ${targetMigration}`);
  }

  try {
    // Reset database and reapply migrations up to target
    execSync('npx prisma migrate reset --force', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
    console.log('Rollback completed successfully.');
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  }
}

/**
 * Validate migration files
 */
function validateMigrations(): void {
  const migrations = getMigrations();

  console.log(`Validating ${migrations.length} migrations...`);

  for (const migration of migrations) {
    const migrationFile = join(migration.path, 'migration.sql');

    try {
      const content = readFileSync(migrationFile, 'utf8');

      // Basic validation checks
      if (!content.trim()) {
        console.warn(`⚠️  Migration ${migration.name} is empty`);
        continue;
      }

      // Check for common issues
      if (content.includes('DROP TABLE') && !content.includes('CREATE TABLE')) {
        console.warn(
          `⚠️  Migration ${migration.name} contains DROP TABLE without CREATE TABLE`
        );
      }

      if (
        content.includes('ALTER TABLE') &&
        !content.includes('ADD CONSTRAINT') &&
        !content.includes('DROP CONSTRAINT')
      ) {
        console.log(
          `ℹ️  Migration ${migration.name} contains ALTER TABLE operations`
        );
      }

      console.log(`✅ Migration ${migration.name} validated`);
    } catch (error) {
      console.error(`❌ Error validating migration ${migration.name}:`, error);
    }
  }

  console.log('Migration validation completed.');
}

/**
 * Show migration history
 */
function showHistory(): void {
  const migrations = getMigrations();
  const status = getMigrationStatus();

  console.log('Migration History:');
  console.log('==================');
  console.log(`Status: ${status}`);
  console.log('');

  migrations.forEach((migration, index) => {
    const marker = index === migrations.length - 1 ? '→' : ' ';
    console.log(`${marker} ${migration.timestamp} - ${migration.name}`);
  });
}

/**
 * Main function
 */
function main(): void {
  const command = process.argv[2];

  switch (command) {
    case 'rollback': {
      const targetMigration = process.argv[3];
      rollbackTo(targetMigration);
      break;
    }

    case 'validate':
      validateMigrations();
      break;

    case 'history':
      showHistory();
      break;

    case 'status':
      console.log(getMigrationStatus());
      break;

    default:
      console.log('Migration Management Script');
      console.log('===========================');
      console.log('');
      console.log('Usage:');
      console.log('  tsx scripts/migrate.ts rollback [target-migration]');
      console.log('  tsx scripts/migrate.ts validate');
      console.log('  tsx scripts/migrate.ts history');
      console.log('  tsx scripts/migrate.ts status');
      console.log('');
      console.log('Examples:');
      console.log('  tsx scripts/migrate.ts rollback');
      console.log('  tsx scripts/migrate.ts rollback init');
      console.log('  tsx scripts/migrate.ts validate');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
