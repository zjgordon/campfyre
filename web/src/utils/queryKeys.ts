// Query keys factory for consistent key generation
export const queryKeys = {
  // User-related queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Project-related queries
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    byOwner: (ownerId: string) =>
      [...queryKeys.projects.all, 'byOwner', ownerId] as const,
  },

  // System/health queries
  system: {
    health: ['system', 'health'] as const,
    status: ['system', 'status'] as const,
  },
} as const;

export default queryKeys;
