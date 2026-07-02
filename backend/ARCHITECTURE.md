# HomiePG Architecture Reference

This document verifies the current project architecture against the target enterprise workflow and records what is implemented now, what is partial, and what is future-state.

## Status Summary

- Implemented now:
  - Express -> Controller -> Service -> Repository -> Prisma -> PostgreSQL layering across core backend modules
  - Request context with request ID and correlation ID
  - Winston logging with request context enrichment
  - Centralized error middleware
  - Standardized API response envelope with `success`, `message`, `data`, `meta`, `timestamp`, `requestId`, `correlationId`
  - Prisma soft-delete columns on major entities
  - Role middleware and JWT authentication middleware
  - Repository-level ownership filtering on owner and user data access paths

- Partial:
  - Ownership validation exists mostly in repository filters, not a dedicated reusable ownership middleware layer
  - Notification architecture has tables and some flows, but no background dispatcher implementation
  - Audit log capture exists for selected mutations, not consistently across every mutation
  - React Query is configured only in owner-app; most clients still use direct service calls or local state wrappers
  - File upload flow works, but compression, virus scan, and object storage lifecycle are not fully implemented

- Future-state / missing:
  - Dedicated `Verification` table does not exist; verification is encoded in entity status columns
  - Generic `Document` table does not exist; documents are split into `OwnerDocument`, `TenantDocument`, `ProfileImage`, `PropertyImage`, `ComplaintImage`
  - Redis / queue worker / background jobs / push delivery worker are not implemented yet
  - Refresh token infrastructure is not implemented
  - Slow query metrics, API metrics, and observability dashboards are not implemented

## 1. Complete Backend Architecture

Target workflow:

```text
Request
↓
Express Router
↓
Authentication Middleware
↓
Role Middleware
↓
Ownership Middleware
↓
Validation Middleware
↓
Controller
↓
Service
↓
Repository
↓
Database
↓
Response Formatter
↓
Client
```

Current project implementation:

```text
Request
↓
Express App
↓
Context Middleware (requestId, correlationId, ip, userAgent)
↓
CORS / Helmet / Compression / Cookie Parser / JSON Parser
↓
Logger Middleware
↓
Rate Limiter
↓
Express Router
↓
JWT Authentication Middleware
↓
Role Middleware
↓
Validation Middleware (selected routes)
↓
Controller
↓
Service
↓
Repository
↓
Prisma
↓
PostgreSQL
↓
ApiResponse Formatter
↓
Client
```

Important note:

- A dedicated global ownership middleware is not yet universal.
- Ownership checks are currently enforced mostly inside repository queries such as:
  - `where: { owner_id: ownerProfileId }`
  - `where: { property: { owner_id: ownerProfileId } }`
  - `where: { tenant_id: tenantId }`

This is secure when repository filters are consistently applied, but it is not yet the same as a dedicated reusable ownership middleware layer.

## 2. Database Schema Documentation

Core entities and relationships:

### Identity and actor model

- `User`
  - Primary identity table
  - One-to-one optional with `OwnerProfile`
  - One-to-one optional with `ManagerProfile`
  - One-to-one optional with `TenantProfile`
  - One-to-one optional with `ProfileImage`
  - One-to-many with `Notification`
  - One-to-many with `AuditLog`

- `OwnerProfile`
  - Foreign key: `user_id -> User.id`
  - Unique: `user_id`
  - One-to-many with `Property`
  - One-to-many with `OwnerDocument`
  - One-to-many with `ManagerProfile`

- `ManagerProfile`
  - Foreign key: `user_id -> User.id`
  - Unique: `user_id`
  - Optional foreign key: `owner_id -> OwnerProfile.id`

- `TenantProfile`
  - Foreign key: `user_id -> User.id`
  - Unique: `user_id`
  - One-to-many with `Booking`
  - One-to-many with `Complaint`
  - One-to-many with `TenantDocument`
  - Optional one-to-one active bed via `Bed.tenant_id`

### Property inventory hierarchy

- `Property`
  - Foreign key: `owner_id -> OwnerProfile.id`
  - Optional foreign key: `area_id -> Area.id`
  - One-to-many with `PropertyImage`
  - One-to-many with `Floor`
  - One-to-many with `Complaint`
  - One-to-many with `Review`

- `Floor`
  - Foreign key: `property_id -> Property.id`
  - One-to-many with `Room`

- `Room`
  - Foreign key: `floor_id -> Floor.id`
  - One-to-many with `Bed`
  - One-to-many with `Complaint`

- `Bed`
  - Foreign key: `room_id -> Room.id`
  - Optional unique foreign key: `tenant_id -> TenantProfile.id`
  - One-to-many with `Booking`

### Transactional and operational entities

- `Booking`
  - Foreign key: `tenant_id -> TenantProfile.id`
  - Foreign key: `bed_id -> Bed.id`

- `Complaint`
  - Foreign key: `tenant_id -> TenantProfile.id`
  - Foreign key: `property_id -> Property.id`
  - Optional foreign key: `room_id -> Room.id`
  - Optional foreign key: `assigned_to_id -> ManagerProfile.id`

- `Notification`
  - Foreign key: `user_id -> User.id`

- `AuditLog`
  - Optional foreign key: `user_id -> User.id`
  - Stores `entity_name`, `entity_id`, `old_values`, `new_values`, `ip_address`

### Image and document entities

- `PropertyImage`
  - Foreign key: `property_id -> Property.id`
  - Optional foreign key: `uploaded_by_id -> User.id`

- `OwnerDocument`
  - Foreign key: `owner_profile_id -> OwnerProfile.id`

- `TenantDocument`
  - Foreign key: `tenant_profile_id -> TenantProfile.id`

### Relationship behavior

- One-to-one:
  - `User -> OwnerProfile`
  - `User -> ManagerProfile`
  - `User -> TenantProfile`
  - `User -> ProfileImage`

- One-to-many:
  - `OwnerProfile -> Property`
  - `Property -> Floor`
  - `Floor -> Room`
  - `Room -> Bed`
  - `TenantProfile -> Booking`
  - `Property -> PropertyImage`

- Foreign key style:
  - UUID primary keys
  - explicit relation fields in Prisma schema

- Cascade behavior:
  - Many child relations use `onDelete: Cascade`
  - Some reviewer / approver / ownership reassignments use `onDelete: SetNull`

- Soft deletes:
  - Most major tables include:
    - `is_deleted`
    - `deleted_at`
    - `deleted_by_id`
  - Operational reads usually filter `is_deleted: false`

- Unique constraints:
  - `User.email` unique
  - `OwnerProfile.user_id` unique
  - `ManagerProfile.user_id` unique
  - `TenantProfile.user_id` unique
  - `ProfileImage.user_id` unique
  - `Bed.tenant_id` unique

Important schema note:

- There is no standalone `Verification` table.
- Verification is stored through fields such as:
  - `OwnerProfile.verification_status`
  - `Property.approval_status`
  - `OwnerDocument.status`
  - `TenantDocument.status`

## 3. Repository Layer Mechanism

Standard enforced pattern in current backend:

```text
Controller
↓
Service
↓
Repository
↓
Prisma
↓
PostgreSQL
```

This pattern is implemented in the following modules:

- `auth`
- `admin`
- `manager`
- `owner`
- `user`
- `template`

Current rule:

- Controllers should not directly access Prisma.
- Services should coordinate business intent.
- Repositories should own data filtering, joins, transactions, and ownership scoping.

Observed state:

- This rule is mostly followed correctly.
- The major gap is not direct DB access in controllers; the gap is inconsistent validation and audit logging across some mutation paths.

## 4. Transaction Flow

Target mutation pattern:

```text
BEGIN
↓
Validation
↓
Insert User
↓
Insert Profile
↓
Insert Documents
↓
Insert Audit Log
↓
Insert Notification
↓
COMMIT
↓
Return Response

If failure
↓
ROLLBACK
```

Current implementation examples:

- Auth registration:
  - `AuthRepository.createTenantUser()`
  - `AuthRepository.createOwner()`
  - Uses `prisma.$transaction(...)`

- User booking creation:
  - `UserRepository.createBooking()`
  - Bed validation
  - Booking insert
  - Bed reservation update
  - Audit log insert

- Password reset:
  - `AuthService.resetPassword()`
  - User password update
  - Audit log insert

Current gap:

- Notifications are not consistently included inside transactions.
- Audit logs are not consistently included inside every mutation.
- Rollback behavior is handled correctly only for flows already wrapped in `prisma.$transaction(...)`.

## 5. Middleware Pipeline

Target middleware pipeline:

```text
Request
↓
Request ID Middleware
↓
Logger
↓
JWT
↓
Role Validation
↓
Ownership Validation
↓
Rate Limiter
↓
Business Validation
↓
Controller
```

Current actual pipeline:

```text
Request
↓
Context Middleware (requestId / correlationId / ip / userAgent)
↓
Helmet / Compression / Cookie Parser / Body Parsers
↓
CORS
↓
Logger Middleware
↓
Rate Limiter
↓
Router
↓
JWT Middleware
↓
Role Middleware
↓
Validation Middleware (route-specific)
↓
Controller
```

Current gap:

- Dedicated ownership middleware is not globally implemented.
- Ownership enforcement currently lives inside repository query constraints.

## 6. Error Handling Standard

Standard statuses now supported or documented:

- `400` Validation / bad request
- `401` Unauthorized
- `403` Forbidden
- `404` Not found
- `409` Conflict
- `422` Business rule failure
- `500` Internal server error

Current implementation state:

- Implemented exception classes:
  - `BadRequestException`
  - `UnauthorizedException`
  - `ForbiddenException`
  - `NotFoundException`
  - `ConflictException`
  - `UnprocessableEntityException`
  - `InternalServerException`

Frontend behavior recommendation:

- `400`: show inline form validation or modal validation summary
- `401`: clear session and redirect to login or session-expired
- `403`: redirect to forbidden screen or show permission warning
- `404`: show empty/not-found state
- `409`: show business conflict message and preserve form state
- `422`: show business-rule explanation, not generic failure
- `500`: show generic retryable server error

## 7. API Response Standard

Current standardized success shape:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "meta": {},
  "timestamp": "...",
  "requestId": "...",
  "correlationId": "..."
}
```

Current standardized error shape:

```json
{
  "success": false,
  "message": "...",
  "errors": [],
  "timestamp": "...",
  "requestId": "...",
  "correlationId": "..."
}
```

This was aligned in the backend response formatter and now covers centralized success/error responses and 404/rate-limit responses.

## 8. Correlation / Request ID

Current implemented flow:

```text
Request
↓
Generate Request ID
↓
Store in AsyncLocalStorage Context
↓
Logger
↓
Controller / Service / Repository
↓
Response Body + Response Headers
↓
Frontend
```

Current implementation details:

- Generated in `context.middleware.ts`
- Stored in `RequestContext`
- Added to Winston logs in `logger.ts`
- Added to response body in `ApiResponse`
- Added to headers:
  - `x-request-id`
  - `x-correlation-id`

Current gap:

- Audit log schema includes `ip_address`, but not `requestId`, `device`, or `browser` columns yet.

## 9. File Upload Lifecycle

Target workflow:

```text
Owner
↓
Backend Validation
↓
Virus Scan (Future)
↓
Compress Image (Future)
↓
Supabase Storage
↓
Metadata Table
↓
Audit Log
↓
Return URL
↓
React Query Refresh
```

Current project workflow:

```text
Owner App DocumentPicker
↓
Frontend converts asset to data URL
↓
POST image payload to backend
↓
Backend creates PropertyImage row
↓
Frontend refetches property details
```

Current implementation state:

- Storage validation utility exists
- Property image metadata table exists
- Supabase environment keys exist in backend config

Current gap:

- No active virus scan pipeline
- No compression pipeline
- No confirmed object storage write path in current property image upload handler
- No audit log written for property image upload yet

## 10. Notification Service Architecture

Target architecture:

```text
Booking Approved
↓
Notification Service
↓
Notification Table
↓
Push Queue
↓
Push Notification
↓
Database
↓
Unread Count
↓
Frontend
```

Current state:

- `Notification` table exists
- `NotificationQueue` table exists
- Notification read APIs exist for user module
- Notification sending controller endpoints exist in manager/owner areas, but some are stubbed

Current gap:

- No implemented background dispatcher for queue consumption
- No push/email/SMS worker
- No unread count caching layer

## 11. Audit Log Architecture

Target architecture:

```text
Action
↓
Old Value
↓
New Value
↓
Entity
↓
Entity ID
↓
Performed By
↓
IP
↓
Device
↓
Browser
↓
Timestamp
↓
Request ID
↓
Database
```

Current implemented fields:

- `action`
- `entity_name`
- `entity_id`
- `old_values`
- `new_values`
- `user_id`
- `ip_address`
- `created_at`

Current gap:

- No explicit `device`, `browser`, `requestId`, or `correlationId` columns
- Audit logging is used in selected flows only, not across every mutation

## 12. React Query Architecture

Target standard should include:

- Query keys
- Cache lifecycle
- Invalidation
- Background refetch
- Optimistic updates
- Retry policy
- Refetch on reconnect
- Refetch on focus

Current project state:

- Owner app:
  - `QueryClientProvider` exists
  - most data fetching still uses custom `useApi` wrapper, not canonical `useQuery` / `useMutation`
- User app:
  - no active React Query layer in current scanned code
- Admin web / Manager web:
  - direct service calls and local component state dominate
  - retry behavior exists in Axios interceptors, not React Query policies

Conclusion:

- React Query architecture is present only partially.
- Query key standardization and invalidation policy are not yet consistently implemented.

## 13. Zustand Architecture

Recommended separation:

### Zustand should hold

- JWT
- Current authenticated user
- Theme
- Sidebar UI
- Local preferences

### React Query should hold

- Properties
- Bookings
- Dashboard metrics
- Notifications
- Complaints

Current project state:

- Zustand is used for:
  - owner app auth store
  - user app auth store
  - admin web auth and UI stores
  - manager web auth and UI stores
- Remote server data is mostly not in Zustand, which is correct
- However remote server data is also not yet consistently in React Query; much of it is in local component state or custom hooks

## 14. Background Job System

Target async tasks:

- Notifications
- Emails
- OTP delivery
- Cleanup jobs
- Analytics
- Report generation

Current project state:

- Notification queue schema exists
- OTP reset currently uses in-memory cache, not a queue or delivery worker
- No Redis worker, cron runner, or job scheduler is present in the scanned backend

Conclusion:

- Background job architecture is schema-ready in parts, but runtime infrastructure is not implemented yet.

## 15. Monitoring & Observability

Current implemented pieces:

- Winston JSON logging
- Console log formatting with request context
- Rotating log files
- Health route
- Prisma query logging in development mode

Current missing pieces:

- Slow query threshold logging
- API metrics dashboard
- request rate / latency metrics export
- database monitoring dashboards
- alerting

## 16. Deployment Architecture

Target deployment topology:

```text
React Native
↓
Express API
↓
Redis (Future)
↓
PostgreSQL
↓
Supabase Storage
↓
Monitoring
↓
Backups
```

Current practical topology:

```text
Owner App / User App / Admin Web / Manager Web
↓
Express Backend
↓
PostgreSQL via Prisma
↓
Supabase-compatible config for auth/storage integration
```

Future recommended additions:

- Redis for queues and OTP storage
- worker process for notifications and emails
- object storage lifecycle standardization
- database backups and metrics

## 17. Security Hardening

Current implemented controls:

- Helmet
- CORS
- Express rate limiting
- Prisma query API reducing SQL injection risk
- bcrypt password hashing
- JWT authentication
- request-scoped logging context

Current partial or missing controls:

- Refresh token rotation not implemented
- CSRF strategy not relevant for pure bearer APIs, but would be needed for cookie auth
- file upload malware scanning not implemented
- stricter CORS allowlist enforcement should be used in production
- XSS mitigation is mostly frontend-framework dependent, not centrally documented
- secret rotation / vault integration not implemented

## 18. Enterprise Naming Standards

Current conventions observed:

- APIs
  - RESTful plural resource routes
  - examples: `/owner/properties`, `/user/bookings`

- Tables / models
  - PascalCase Prisma model names
  - snake_case database column names

- Enums
  - UPPER_SNAKE_CASE enum values

- DTO / schema objects
  - currently mixed; some use Zod schema objects in `dto` files

- Services
  - `<Module>Service`

- Repositories
  - `<Module>Repository`

- Files and folders
  - module-based foldering under `src/modules/<module>`
  - middleware under `src/middlewares`
  - config under `src/config`

Recommended standardization still needed:

- Query key naming (if React Query expands)
- uniform DTO naming
- uniform response contract usage in every route

## 19. Complete Data Flow Chapter

Reusable enterprise data flow:

```text
User Action
↓
Frontend
↓
Client Validation
↓
API Call
↓
Request Context Middleware
↓
Logger / Rate Limit / Security Middleware
↓
JWT / Role Validation
↓
Controller
↓
Service
↓
Repository
↓
Database
↓
Commit / Rollback
↓
Audit Log (partial today)
↓
Notification (partial today)
↓
Response Formatter
↓
Frontend State Refresh
↓
UI Update
```

Feature examples:

- Owner registers property
- Admin verifies property
- User sees newly verified property
- Tenant books a bed

Each of these should be interpreted through the same flow.

## 20. System Architecture Diagram

```text
                Admin Web
                    │
                    │
                Manager Web
                    │
                    │
        ┌─────────────┴─────────────┐
        │                           │
      Owner App                 User App
        │                           │
        └─────────────┬─────────────┘
                      │
               Express Backend
                      │
      ┌───────────────┼───────────────┐
      │               │               │
 PostgreSQL     Supabase Storage   Background Jobs
      │               │               │
      └───────────────┴───────────────┘
                      │
           Monitoring & Audit Logs
```

Reality check for this repository:

- `Express Backend` is implemented
- `PostgreSQL` via Prisma is implemented
- `Supabase Storage` is only partially wired in current scanned upload flows
- `Background Jobs` is planned / partial, not fully implemented
- `Monitoring & Audit Logs` exists partially through Winston and AuditLog

## Recommended Next Hardening Steps

1. Add a reusable ownership middleware layer for property / floor / room / bed scoped routes.
2. Standardize all mutation flows to always write audit logs.
3. Introduce a real notification service plus worker.
4. Move OTP and async tasks to Redis-backed storage / queue.
5. Expand React Query to true query keys, invalidation, and mutations across clients.
6. Add metrics, traces, and slow-query monitoring.
7. Add file object storage lifecycle, validation, compression, and malware scanning.
