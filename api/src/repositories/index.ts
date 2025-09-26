/**
 * Repository exports for clean data access layer
 * Implements the Repository pattern for type-safe database operations
 */

export { BaseRepository } from './BaseRepository';
export { UserRepository } from './UserRepository';
export { CampaignRepository } from './CampaignRepository';
export { SessionRepository } from './SessionRepository';

// Import repository classes
import { UserRepository } from './UserRepository';
import { CampaignRepository } from './CampaignRepository';
import { SessionRepository } from './SessionRepository';

// Repository instances for dependency injection
export const userRepository = new UserRepository();
export const campaignRepository = new CampaignRepository();
export const sessionRepository = new SessionRepository();

// Repository factory for creating new instances
export class RepositoryFactory {
  static createUserRepository(): UserRepository {
    return new UserRepository();
  }

  static createCampaignRepository(): CampaignRepository {
    return new CampaignRepository();
  }

  static createSessionRepository(): SessionRepository {
    return new SessionRepository();
  }
}

// Repository container for dependency injection
export class RepositoryContainer {
  private static instance: RepositoryContainer;
  private repositories: Map<string, any> = new Map();

  private constructor() {
    this.initializeRepositories();
  }

  static getInstance(): RepositoryContainer {
    if (!RepositoryContainer.instance) {
      RepositoryContainer.instance = new RepositoryContainer();
    }
    return RepositoryContainer.instance;
  }

  private initializeRepositories(): void {
    this.repositories.set('user', new UserRepository());
    this.repositories.set('campaign', new CampaignRepository());
    this.repositories.set('session', new SessionRepository());
  }

  getUserRepository(): UserRepository {
    return this.repositories.get('user');
  }

  getCampaignRepository(): CampaignRepository {
    return this.repositories.get('campaign');
  }

  getSessionRepository(): SessionRepository {
    return this.repositories.get('session');
  }

  getRepository<T>(name: string): T {
    return this.repositories.get(name);
  }
}

// Export the singleton instance
export const repositoryContainer = RepositoryContainer.getInstance();
