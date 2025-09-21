# 🏗️ Framework Foundations Plan

**Phase 2 Implementation Plan for Campfyre**

This document provides a detailed, bite-sized task breakdown to complete Phase 2: Framework Foundations, ensuring all outcomes are satisfied while maintaining the project's vision of being lightweight, modular, and system-agnostic.

---

## Phase 2 Overview

**Objective:** Lay down the skeleton architecture with modular boundaries and containerized deployment.

**Outcome:** A minimal "hello world" stack runs locally and in Docker, ready to host features incrementally.

---

## Technical Architecture Decisions

### **Frontend Stack**

| Component            | Technology               | Version       | Rationale                                                 |
| -------------------- | ------------------------ | ------------- | --------------------------------------------------------- |
| **Framework**        | React                    | 18.2+         | Stable, mature, excellent ecosystem                       |
| **Build Tool**       | Vite                     | 5.0+          | Fast dev server, optimized builds                         |
| **UI Library**       | Material-UI (MUI)        | 7.0+          | Latest version with Material Design 3, better performance |
| **State Management** | TanStack Query + Zustand | 5.0+ / 4.4+   | Server state + client state separation                    |
| **Forms**            | React Hook Form + Zod    | 7.45+ / 3.22+ | Type-safe forms with validation                           |
| **Routing**          | React Router             | 6.20+         | SPA routing, stable API                                   |
| **Styling**          | Emotion (via MUI)        | 11.11+        | CSS-in-JS with MUI integration                            |

### **Backend Stack**

| Component      | Technology | Version  | Rationale                           |
| -------------- | ---------- | -------- | ----------------------------------- |
| **Runtime**    | Node.js    | 20.x LTS | Long-term support, stable           |
| **Framework**  | Fastify    | 4.24+    | High performance, TypeScript native |
| **API Layer**  | tRPC       | 10.45+   | End-to-end type safety              |
| **Database**   | PostgreSQL | 15+      | Robust relational database          |
| **ORM**        | Prisma     | 5.7+     | Type-safe database access           |
| **Cache**      | Redis      | 7.2+     | Fast in-memory data store           |
| **Validation** | Zod        | 3.22+    | Shared schemas, runtime validation  |

### **Real-time & Communication**

| Component       | Technology       | Version | Rationale                        |
| --------------- | ---------------- | ------- | -------------------------------- |
| **WebSocket**   | ws (Node.js)     | 8.14+   | Lightweight WebSocket server     |
| **Signaling**   | Custom WebSocket | -       | Simple, reliable for MVP         |
| **Video/Voice** | WebRTC           | Native  | Browser-native, no external deps |
| **TURN Server** | Coturn           | 4.6+    | NAT traversal for WebRTC         |

### **Infrastructure & Deployment**

| Component            | Technology     | Version | Rationale                       |
| -------------------- | -------------- | ------- | ------------------------------- |
| **Containerization** | Docker         | 24+     | Industry standard               |
| **Orchestration**    | Docker Compose | 2.20+   | Simple multi-service deployment |
| **Reverse Proxy**    | Caddy          | 2.7+    | Automatic HTTPS, simple config  |
| **File Storage**     | MinIO          | 2023+   | S3-compatible, self-hosted      |

### **Development & Quality**

| Component       | Technology | Version | Rationale                      |
| --------------- | ---------- | ------- | ------------------------------ |
| **TypeScript**  | TypeScript | 5.2+    | Latest stable with strict mode |
| **Linting**     | ESLint     | 8.54+   | Code quality and consistency   |
| **Formatting**  | Prettier   | 3.1+    | Code formatting                |
| **Testing**     | Vitest     | 1.0+    | Fast testing, Vite integration |
| **E2E Testing** | Playwright | 1.40+   | Cross-browser testing          |

### **Compatibility Matrix**

| Frontend            | Backend       | Database       | Real-time   | Status        |
| ------------------- | ------------- | -------------- | ----------- | ------------- |
| React 18.2+         | Node.js 20.x  | PostgreSQL 15+ | WebSocket   | ✅ Compatible |
| MUI v7              | Fastify 4.24+ | Prisma 5.7+    | ws 8.14+    | ✅ Compatible |
| Emotion 11.11+      | tRPC 10.45+   | Redis 7.2+     | WebRTC      | ✅ Compatible |
| TanStack Query 5.0+ | Zod 3.22+     | -              | Coturn 4.6+ | ✅ Compatible |
| Zustand 4.4+        | -             | -              | -           | ✅ Compatible |

### **Critical Compatibility Notes**

- **MUI v7**: Uses Emotion 11.11+ (not MUI v5's Emotion 10.x)
- **tRPC + Fastify**: Ensure @trpc/server and @fastify/cors compatibility
- **Prisma + PostgreSQL**: Use Prisma 5.7+ with PostgreSQL 15+ for best performance
- **Zod**: Shared between frontend and backend for consistent validation
- **TypeScript**: 5.2+ across all packages for consistent type checking

### **Dependency Management Strategy**

- **Lock Files**: Use `pnpm-lock.yaml` for exact version locking
- **Version Ranges**: Use `^` for patch updates, `~` for minor updates
- **Peer Dependencies**: Ensure all peer dependencies are compatible
- **Regular Updates**: Monthly dependency updates with compatibility testing
- **Breaking Changes**: Test major version updates in separate branch

### **Package Installation Order**

1. **Core Dependencies**: React, Vite, TypeScript
2. **UI Framework**: MUI v7 + Emotion 11.11+
3. **State Management**: TanStack Query + Zustand
4. **Backend**: Fastify + tRPC + Prisma
5. **Validation**: Zod (shared package)
6. **Testing**: Vitest + Playwright

## Project Context Analysis

Based on the project vision and user journey, Campfyre needs to be:

- **Lightweight**: Easy to host with Docker
- **Modular**: Mix and match features (video, maps, sheets, dice)
- **System-agnostic**: Works for any TTRPG system
- **Modern**: Sleek design, themable, mobile-friendly
- **Streaming-ready**: Overlay support for content creators

---

## Task Breakdown

### **Task 1: Frontend Scaffold Setup**

**Duration:** 2-3 hours  
**Priority:** High

#### 1.1 React + Vite Foundation

- [ ] Initialize Vite 5.0+ React 18.2+ project in `/web` directory
- [ ] Configure TypeScript 5.2+ with strict settings matching root config
- [ ] Set up React Router 6.20+ for SPA navigation
- [ ] Configure build output for containerization with proper asset handling

#### 1.2 Material-UI v7 Integration

- [ ] Install MUI v7.0+ with Emotion 11.11+ (not MUI v5)
- [ ] Configure Material Design 3 theme system with proper tokens
- [ ] Set up MUI v7 component library and theming
- [ ] Create base layout components (AppBar, Navigation, etc.) using MUI v7
- [ ] Implement responsive design breakpoints with MUI's breakpoint system

#### 1.3 State Management Setup

- [ ] Install TanStack Query 5.0+ for server state management
- [ ] Install Zustand 4.4+ for client state management
- [ ] Create store structure for user, session, and game state
- [ ] Implement persistence for user preferences using Zustand persist
- [ ] Set up proper TypeScript types for all stores

#### 1.4 Form Handling & Validation

- [ ] Install React Hook Form 7.45+ with Zod 3.22+ integration
- [ ] Set up form handling with type-safe validation
- [ ] Create reusable form components using MUI v7 components
- [ ] Implement error handling and user feedback with MUI v7 Alert/Snackbar
- [ ] Ensure Zod schemas are shared with backend validation

**Deliverables:**

- Working React + Vite application
- Material Design 3 theming system
- State management architecture
- Form validation framework

---

### **Task 2: Backend Scaffold Setup**

**Duration:** 3-4 hours  
**Priority:** High

#### 2.1 Fastify + tRPC Foundation

- [ ] Migrate from Express to Fastify 4.24+
- [ ] Install and configure tRPC 10.45+ for type-safe APIs
- [ ] Set up tRPC router structure with procedures
- [ ] Configure CORS and security middleware with @fastify/cors
- [ ] Ensure compatibility between Fastify and tRPC versions

#### 2.2 API Architecture

- [ ] Create modular router structure (auth, games, users, etc.)
- [ ] Implement error handling middleware compatible with tRPC
- [ ] Set up request/response logging with @fastify/pino
- [ ] Create API versioning strategy using tRPC procedures
- [ ] Ensure proper TypeScript integration throughout

#### 2.3 Type Safety

- [ ] Set up shared types package with proper exports
- [ ] Create tRPC client configuration for frontend
- [ ] Implement type-safe API calls with tRPC client
- [ ] Set up runtime validation with Zod 3.22+ (shared with frontend)
- [ ] Ensure end-to-end type safety from database to frontend

**Deliverables:**

- Fastify + tRPC API server
- Type-safe API architecture
- Error handling and logging
- Shared type definitions

---

### **Task 3: Database Integration**

**Duration:** 4-5 hours  
**Priority:** High

#### 3.1 Prisma Setup

- [ ] Install and configure Prisma 5.7+ ORM
- [ ] Set up database connection and environment variables
- [ ] Create initial database schema for core entities
- [ ] Configure Prisma client with connection pooling
- [ ] Ensure compatibility with PostgreSQL 15+

#### 3.2 Core Database Schema

- [ ] Design and implement User entity with proper constraints
- [ ] Create Campaign and Session entities with relationships
- [ ] Design Character Sheet template system (JSON-based)
- [ ] Implement Game System templates with versioning
- [ ] Ensure schema supports future WebRTC and real-time features

#### 3.3 Database Migrations

- [ ] Set up Prisma migration system with proper naming
- [ ] Create initial migration for core schema
- [ ] Implement database seeding for development with realistic data
- [ ] Set up migration rollback procedures
- [ ] Add migration validation and testing

#### 3.4 Database Operations

- [ ] Create repository pattern for data access with TypeScript
- [ ] Implement CRUD operations for core entities
- [ ] Set up database transactions with proper error handling
- [ ] Add database health checks with connection testing
- [ ] Implement proper indexing for performance

**Deliverables:**

- PostgreSQL database with Prisma ORM
- Core database schema
- Migration system
- Data access layer

---

### **Task 4: Real-time Infrastructure**

**Duration:** 3-4 hours  
**Priority:** Medium

#### 4.1 WebSocket Server

- [ ] Set up WebSocket server with Fastify
- [ ] Implement connection management
- [ ] Create room-based messaging system
- [ ] Add connection health monitoring

#### 4.2 Redis Integration

- [ ] Configure Redis for caching and pub/sub
- [ ] Implement presence tracking
- [ ] Set up message broadcasting
- [ ] Add Redis health checks

#### 4.3 TURN Server Configuration

- [ ] Verify Coturn configuration in docker-compose
- [ ] Test WebRTC connectivity
- [ ] Implement STUN/TURN discovery
- [ ] Add TURN server health monitoring

**Deliverables:**

- WebSocket server for real-time communication
- Redis integration for presence and messaging
- WebRTC infrastructure ready

---

### **Task 5: Error Handling & Contracts**

**Duration:** 2-3 hours  
**Priority:** Medium

#### 5.1 Error Shape Contract

- [ ] Define consistent error response format
- [ ] Implement error classification system
- [ ] Create error handling middleware
- [ ] Set up error logging and monitoring

#### 5.2 API Response Standards

- [ ] Standardize success response format
- [ ] Implement pagination standards
- [ ] Create validation error responses
- [ ] Set up API documentation structure

#### 5.3 Client Error Handling

- [ ] Implement global error boundary
- [ ] Create error display components
- [ ] Set up retry mechanisms
- [ ] Add error reporting system

**Deliverables:**

- Consistent error handling across stack
- Standardized API responses
- Client-side error management

---

### **Task 6: Containerization & Deployment**

**Duration:** 2-3 hours  
**Priority:** High

#### 6.1 Docker Configuration

- [ ] Update Dockerfiles for new dependencies
- [ ] Optimize container build process
- [ ] Set up multi-stage builds
- [ ] Configure container health checks

#### 6.2 Docker Compose Integration

- [ ] Update docker-compose.yml for new services
- [ ] Configure service dependencies
- [ ] Set up volume mounts for development
- [ ] Add service health monitoring

#### 6.3 Reverse Proxy Setup

- [ ] Configure Caddy for API and web routing
- [ ] Set up HTTPS with automatic certificates
- [ ] Implement load balancing
- [ ] Add security headers

**Deliverables:**

- Fully containerized application
- One-command deployment
- HTTPS-enabled reverse proxy

---

### **Task 7: Health Monitoring & Observability**

**Duration:** 1-2 hours  
**Priority:** Medium

#### 7.1 Health Endpoints

- [ ] Enhance existing health endpoints
- [ ] Add database connectivity checks
- [ ] Implement Redis health checks
- [ ] Create comprehensive health status

#### 7.2 Logging & Metrics

- [ ] Set up structured logging
- [ ] Implement request/response logging
- [ ] Add performance metrics
- [ ] Create log aggregation

#### 7.3 Development Tools

- [ ] Add development debugging tools
- [ ] Create API testing utilities
- [ ] Set up database inspection tools
- [ ] Implement development seed data

**Deliverables:**

- Comprehensive health monitoring
- Structured logging system
- Development debugging tools

---

### **Task 8: Integration Testing & Validation**

**Duration:** 2-3 hours  
**Priority:** Medium

#### 8.1 End-to-End Testing

- [ ] Test complete stack startup with all services
- [ ] Verify all services communicate properly
- [ ] Test database operations with Prisma
- [ ] Validate real-time functionality with WebSocket
- [ ] Test MUI v7 components render correctly

#### 8.2 API Integration Tests

- [ ] Test tRPC procedures with proper typing
- [ ] Validate error handling across all layers
- [ ] Test authentication flow with Zod validation
- [ ] Verify data persistence with Prisma
- [ ] Test Fastify + tRPC integration

#### 8.3 Compatibility Testing

- [ ] Test MUI v7 + Emotion 11.11+ integration
- [ ] Validate TanStack Query + tRPC client
- [ ] Test Zustand + React 18.2+ compatibility
- [ ] Verify Prisma + PostgreSQL 15+ performance
- [ ] Test WebRTC + Coturn integration

#### 8.4 Performance Testing

- [ ] Test container startup time
- [ ] Measure API response times
- [ ] Validate memory usage across services
- [ ] Test concurrent connections
- [ ] Benchmark MUI v7 component rendering

**Deliverables:**

- Comprehensive test suite
- Performance benchmarks
- Integration validation

---

## Implementation Strategy

### **Phase 2A: Core Foundation (Tasks 1-3)**

- Focus on React + Vite frontend
- Fastify + tRPC backend
- PostgreSQL + Prisma database
- **Timeline:** 9-12 hours

### **Phase 2B: Real-time & Infrastructure (Tasks 4-6)**

- WebSocket and Redis integration
- Error handling and contracts
- Containerization and deployment
- **Timeline:** 7-10 hours

### **Phase 2C: Monitoring & Validation (Tasks 7-8)**

- Health monitoring and observability
- Integration testing and validation
- **Timeline:** 3-5 hours

---

## Success Criteria

### **Technical Requirements**

- [ ] React + Vite frontend with Material Design 3
- [ ] Fastify + tRPC backend with type safety
- [ ] PostgreSQL database with Prisma ORM
- [ ] Redis integration for real-time features
- [ ] WebSocket server for live communication
- [ ] Docker Compose deployment working end-to-end
- [ ] Caddy reverse proxy with HTTPS
- [ ] Comprehensive error handling
- [ ] Health endpoints for all services

### **Functional Requirements**

- [ ] "Hello world" application running locally
- [ ] "Hello world" application running in Docker
- [ ] All services communicate properly
- [ ] Database operations working
- [ ] Real-time messaging functional
- [ ] Error handling consistent across stack
- [ ] Health monitoring operational

### **Quality Requirements**

- [ ] Type safety throughout the stack
- [ ] Comprehensive error handling
- [ ] Proper logging and monitoring
- [ ] Performance within acceptable limits
- [ ] Security best practices implemented
- [ ] Code follows project standards

---

## Risk Mitigation

### **Technical Risks**

- **Complexity**: Break tasks into small, manageable pieces
- **Integration**: Test each component as it's built
- **Performance**: Monitor and optimize as needed
- **Security**: Implement security from the start

### **Timeline Risks**

- **Scope Creep**: Stick to Phase 2 requirements only
- **Dependencies**: Plan task order carefully
- **Testing**: Include testing time in estimates
- **Documentation**: Document as you go

---

## Next Steps

1. **Review and Approve Plan**: Ensure all stakeholders agree on approach
2. **Set Up Development Environment**: Ensure all tools are ready
3. **Begin Phase 2A**: Start with core foundation tasks
4. **Regular Checkpoints**: Review progress after each phase
5. **Prepare for Phase 3**: Plan for Core MVP Features

---

## Conclusion

This plan provides a comprehensive, bite-sized approach to completing Phase 2: Framework Foundations. Each task is designed to be completed in 1-4 hours, with clear deliverables and success criteria. The modular approach ensures that the foundation is solid while maintaining the project's vision of being lightweight, modular, and system-agnostic.

The resulting framework will provide a robust foundation for building the Core MVP Features in Phase 3, while maintaining the project's core principles of ease of access, modular design, and modern user experience.
