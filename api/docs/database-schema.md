# Database Schema Documentation

This document describes the comprehensive database schema for the Campfyre TTRPG platform, designed to support tabletop role-playing games with real-time features, character management, and campaign organization.

## Overview

The database schema is built using Prisma ORM with PostgreSQL and is designed to be:

- **Scalable**: Supports multiple game systems and large campaigns
- **Flexible**: JSON-based character sheets adapt to different TTRPG systems
- **Real-time Ready**: Schema supports WebRTC and live communication features
- **Type-safe**: Full TypeScript integration with Prisma-generated types

## Core Entities

### User

The central entity representing platform users (players, GMs, observers).

**Fields:**

- `id`: Unique identifier (CUID)
- `email`: User's email address (unique)
- `username`: Display username (unique)
- `name`: Full name (optional)
- `avatar`: Profile image URL (optional)
- `bio`: User biography (optional)
- `preferences`: JSON object containing user preferences
- `isActive`: Account status flag
- `lastLoginAt`: Timestamp of last login
- `createdAt`/`updatedAt`: Standard timestamps

**Relationships:**

- Owns multiple campaigns
- Member of multiple campaigns
- Has multiple characters
- Has multiple user sessions
- Can GM multiple game sessions
- Sends/receives messages
- Receives notifications

### Campaign

Represents a TTRPG campaign with multiple sessions and players.

**Fields:**

- `id`: Unique identifier (CUID)
- `name`: Campaign name
- `description`: Campaign description (optional)
- `image`: Campaign image URL (optional)
- `status`: Campaign status (ACTIVE, PAUSED, COMPLETED, CANCELLED)
- `visibility`: Campaign visibility (PRIVATE, PUBLIC, UNLISTED)
- `maxPlayers`: Maximum number of players
- `currentPlayers`: Current number of active players
- `settings`: JSON object with campaign-specific settings
- `metadata`: JSON object with additional campaign metadata
- `createdAt`/`updatedAt`: Standard timestamps

**Relationships:**

- Owned by one user
- Has multiple members
- Contains multiple characters
- Has multiple game sessions
- Uses one game system

### CampaignMember

Junction table managing user membership in campaigns.

**Fields:**

- `id`: Unique identifier (CUID)
- `role`: User's role in campaign (OWNER, GM, PLAYER, OBSERVER)
- `joinedAt`: When user joined the campaign
- `leftAt`: When user left (optional)
- `isActive`: Current membership status

**Relationships:**

- Belongs to one user
- Belongs to one campaign

### Character

Represents player characters within campaigns.

**Fields:**

- `id`: Unique identifier (CUID)
- `name`: Character name
- `description`: Character description (optional)
- `image`: Character image URL (optional)
- `level`: Character level
- `experience`: Character experience points
- `characterSheet`: JSON object containing complete character data
- `isActive`: Character status flag
- `createdAt`/`updatedAt`: Standard timestamps

**Relationships:**

- Owned by one user
- Belongs to one campaign
- Participates in multiple game sessions

### GameSystem

Defines different TTRPG systems (D&D, Pathfinder, etc.).

**Fields:**

- `id`: Unique identifier (CUID)
- `name`: System name (unique)
- `version`: System version
- `description`: System description (optional)
- `publisher`: System publisher (optional)
- `isActive`: System availability flag
- `characterSheetTemplate`: JSON template for character sheets
- `rules`: JSON object with system-specific rules
- `metadata`: JSON object with additional system metadata
- `createdAt`/`updatedAt`: Standard timestamps

**Relationships:**

- Used by multiple campaigns

### GameSession

Individual play sessions within campaigns.

**Fields:**

- `id`: Unique identifier (CUID)
- `name`: Session name
- `description`: Session description (optional)
- `scheduledAt`: Scheduled start time (optional)
- `startedAt`: Actual start time (optional)
- `endedAt`: End time (optional)
- `status`: Session status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
- `settings`: JSON object with session-specific settings
- `notes`: GM notes (optional)
- `createdAt`/`updatedAt`: Standard timestamps

**Relationships:**

- Belongs to one campaign
- GM'd by one user
- Has multiple character participants
- Contains multiple messages

### GameSessionCharacter

Junction table for character participation in sessions.

**Fields:**

- `id`: Unique identifier (CUID)
- `isPresent`: Whether character is present in session
- `notes`: Session-specific notes for character

**Relationships:**

- Belongs to one game session
- Belongs to one character

### Message

Real-time communication within game sessions.

**Fields:**

- `id`: Unique identifier (CUID)
- `content`: Message content
- `type`: Message type (TEXT, SYSTEM, DICE_ROLL, CHARACTER_ACTION, GM_ANNOUNCEMENT)
- `metadata`: JSON object with message metadata (mentions, reactions, dice rolls)
- `isEdited`: Whether message has been edited
- `editedAt`: Edit timestamp (optional)
- `createdAt`/`updatedAt`: Standard timestamps

**Relationships:**

- Authored by one user
- Belongs to one game session (optional)

### Notification

User notifications for various platform events.

**Fields:**

- `id`: Unique identifier (CUID)
- `title`: Notification title
- `content`: Notification content
- `type`: Notification type (CAMPAIGN_INVITE, SESSION_REMINDER, MESSAGE_MENTION, SYSTEM_UPDATE, CAMPAIGN_UPDATE)
- `isRead`: Read status flag
- `metadata`: JSON object with notification metadata
- `createdAt`: Creation timestamp
- `readAt`: Read timestamp (optional)

**Relationships:**

- Belongs to one user

### UserSession

Authentication sessions for users.

**Fields:**

- `id`: Unique identifier (CUID)
- `token`: Session token (unique)
- `expiresAt`: Session expiration time
- `deviceInfo`: JSON object with device information
- `ipAddress`: User's IP address (optional)
- `isActive`: Session status flag
- `createdAt`/`updatedAt`: Standard timestamps

**Relationships:**

- Belongs to one user

## JSON Schema Definitions

### Character Sheet Data Structure

The `characterSheet` field in the Character model uses a flexible JSON structure:

```json
{
  "basicInfo": {
    "name": "string",
    "class": "string",
    "race": "string",
    "background": "string",
    "alignment": "string",
    "level": "number",
    "experience": "number"
  },
  "attributes": {
    "strength": {
      "value": "number",
      "modifier": "number",
      "temporary": "number"
    }
  },
  "skills": {
    "athletics": {
      "value": "number",
      "proficient": "boolean",
      "expertise": "boolean",
      "modifier": "number"
    }
  },
  "equipment": {
    "weapons": [
      {
        "name": "string",
        "damage": "string",
        "type": "string",
        "properties": ["string"]
      }
    ],
    "armor": [
      {
        "name": "string",
        "ac": "number",
        "type": "string"
      }
    ],
    "items": [
      {
        "name": "string",
        "quantity": "number",
        "weight": "number",
        "description": "string"
      }
    ]
  },
  "spells": {
    "known": ["string"],
    "prepared": ["string"],
    "slots": {
      "1st": "number",
      "2nd": "number"
    }
  },
  "health": {
    "current": "number",
    "maximum": "number",
    "temporary": "number",
    "hitDice": "string"
  },
  "customFields": {},
  "notes": {
    "background": "string",
    "personality": "string",
    "ideals": "string",
    "bonds": "string",
    "flaws": "string",
    "other": "string"
  }
}
```

### Game System Template Structure

The `characterSheetTemplate` field in the GameSystem model defines the structure for character sheets:

```json
{
  "attributes": [
    {
      "name": "string",
      "abbreviation": "string",
      "description": "string"
    }
  ],
  "skills": [
    {
      "name": "string",
      "attribute": "string",
      "description": "string"
    }
  ],
  "classes": [
    {
      "name": "string",
      "description": "string",
      "hitDie": "string",
      "primaryAttributes": ["string"]
    }
  ],
  "races": [
    {
      "name": "string",
      "description": "string",
      "abilityScoreIncrease": {
        "strength": "number"
      }
    }
  ]
}
```

### Message Metadata Structure

The `metadata` field in the Message model supports rich message features:

```json
{
  "mentions": ["user_id"],
  "reactions": {
    "👍": ["user_id"],
    "🎲": ["user_id"]
  },
  "diceRolls": [
    {
      "expression": "2d6+3",
      "result": 12,
      "rolls": [4, 5]
    }
  ],
  "characterAction": {
    "characterId": "character_id",
    "action": "Attack",
    "target": "Goblin"
  },
  "systemMessage": {
    "type": "join",
    "data": {}
  }
}
```

## Real-time Features Support

The schema is designed to support real-time features:

### WebRTC Integration

- User sessions track device information for WebRTC connections
- Game session settings include voice/video chat preferences
- Message metadata supports real-time communication features

### Live Updates

- Messages support real-time chat with mentions and reactions
- Character sheets can be updated in real-time during sessions
- Game session status changes are tracked for live updates

### Notifications

- Real-time notifications for campaign events
- Message mentions trigger immediate notifications
- Session reminders and updates

## Indexing Strategy

### Primary Indexes

- All `id` fields (primary keys)
- Unique constraints on `email`, `username`, `token`
- Composite indexes on foreign key relationships

### Performance Indexes

- `campaignId` on characters and game sessions
- `userId` on all user-related entities
- `gameSessionId` on messages
- `createdAt` for time-based queries

### Search Indexes

- Full-text search on campaign names and descriptions
- Character name and description search
- Message content search (with privacy considerations)

## Data Validation

### Prisma Schema Validation

- All required fields are marked as non-nullable
- String length limits enforced at database level
- Enum values restricted to predefined options
- Foreign key constraints ensure referential integrity

### Application-Level Validation

- Zod schemas for all input validation
- Character sheet JSON structure validation
- Message content sanitization
- File upload validation for images

## Security Considerations

### Data Protection

- Sensitive data (passwords, tokens) handled separately
- User preferences and settings properly typed
- Message content limited to prevent abuse
- Image URLs validated for security

### Access Control

- Campaign visibility controls data access
- Role-based permissions through campaign membership
- Session-based authentication with expiration
- IP address tracking for security monitoring

## Migration Strategy

### Schema Evolution

- Backward-compatible changes preferred
- JSON fields allow flexible schema evolution
- Version tracking for game systems
- Gradual migration for breaking changes

### Data Migration

- Prisma migrations for structural changes
- Custom scripts for data transformation
- Backup strategies for critical data
- Rollback procedures for failed migrations

## Performance Optimization

### Query Optimization

- Eager loading for related data
- Pagination for large result sets
- Efficient filtering and sorting
- Connection pooling for database access

### Caching Strategy

- Redis caching for frequently accessed data
- Character sheet caching during sessions
- Campaign metadata caching
- User session caching

## Monitoring and Analytics

### Database Metrics

- Query performance monitoring
- Connection pool utilization
- Index usage statistics
- Error rate tracking

### Business Metrics

- User engagement tracking
- Campaign activity metrics
- Session duration analytics
- Popular game systems tracking

## Future Considerations

### Scalability

- Horizontal scaling with read replicas
- Sharding strategies for large datasets
- Microservice architecture support
- Event-driven architecture integration

### Feature Extensions

- Plugin system for custom game mechanics
- Advanced character sheet customization
- Campaign template system
- Integration with external TTRPG tools

This schema provides a solid foundation for a comprehensive TTRPG platform while maintaining flexibility for future enhancements and system-specific customizations.
