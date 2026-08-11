# BGR --- Technical Specification

## 0. Technical Direction

### Final Architecture Decision

BGR is a **monolithic internal web application**.

Target deployment:

-   one local server PC,
-   PostgreSQL on the same server,
-   Next.js application on the same server,
-   local document storage on the same server,
-   client computers access the application through a browser over LAN.

Example:

``` text
                 OFFICE ROUTER
                       |
              +--------+--------+
              |        |        |
           Server    User A   User B
              |
      +-------+-------+
      |               |
   Next.js         PostgreSQL
      |
 Local document storage
```

No internet connection is required for normal application operation.

------------------------------------------------------------------------

# 1. Technology Stack

## 1.1 Required

-   Next.js
-   TypeScript
-   PostgreSQL
-   Prisma ORM
-   Tailwind CSS
-   shadcn/ui

## 1.2 Recommended

-   Next.js App Router
-   Zod for runtime validation
-   bcrypt or Argon2-compatible password hashing
-   React Hook Form for complex forms
-   Recharts or equivalent for dashboard charts
-   Vitest/Jest for unit tests
-   Playwright for end-to-end tests
-   Docker Compose for repeatable local deployment

## 1.3 Explicitly Avoid

Do not introduce:

-   microservices,
-   Kubernetes,
-   Redis unless a real requirement appears,
-   message brokers,
-   GraphQL,
-   API Gateway inside the MVP,
-   Supabase as a runtime dependency,
-   external cloud services for core operation,
-   unnecessary state-management libraries.

The application should remain a simple monolith.

------------------------------------------------------------------------

# 2. Application Architecture

Use layered organization inside one Next.js repository.

``` text
Presentation
    ↓
Application / Server Actions / Route Handlers
    ↓
Domain Services
    ↓
Repositories / Prisma
    ↓
PostgreSQL
```

For file operations:

``` text
Application
    ↓
Document Service
    ↓
Local File Storage
```

## 2.1 Presentation Layer

Contains:

-   pages,
-   layouts,
-   forms,
-   tables,
-   dialogs,
-   cards,
-   charts,
-   navigation,
-   notifications.

No direct database calls from client components.

## 2.2 Application Layer

Responsible for:

-   authentication checks,
-   authorization checks,
-   request parsing,
-   orchestration,
-   transactions,
-   calling domain services.

## 2.3 Domain Service Layer

Responsible for business operations such as:

-   referral submission,
-   validation,
-   approval,
-   rejection,
-   revision request,
-   assignment,
-   status transitions,
-   document validation,
-   notification creation.

## 2.4 Repository Layer

Repository methods encapsulate persistence.

Example:

``` ts
interface ReferralRepository {
  findById(id: string): Promise<Referral | null>;
  create(input: CreateReferralInput): Promise<Referral>;
  update(id: string, input: UpdateReferralInput): Promise<Referral>;
  list(filter: ReferralFilter): Promise<PaginatedResult<Referral>>;
}
```

Do not create an abstraction for every trivial Prisma call. Introduce
repositories where they provide meaningful domain separation.

------------------------------------------------------------------------

# 3. Next.js Rules

Use App Router.

Suggested structure:

``` text
app/
├── (auth)/
│   └── login/
├── (protected)/
│   ├── dashboard/
│   ├── referrals/
│   ├── approvals/
│   ├── monitoring/
│   ├── analytics/
│   ├── documents/
│   ├── notifications/
│   ├── users/
│   ├── business-groups/
│   └── settings/
└── api/
```

Prefer Server Components for read-heavy pages.

Use Client Components only when browser interactivity is required.

Use Server Actions or Route Handlers for mutations.

Never expose database credentials to the browser.

------------------------------------------------------------------------

# 4. Authentication

MVP uses local authentication.

Required:

-   login,
-   logout,
-   password hashing,
-   session,
-   inactive-user blocking.

Passwords must never be stored in plaintext.

Session must identify:

-   user ID,
-   role,
-   relevant business unit,
-   expiry.

The exact authentication library can be selected during implementation,
but the agent must not invent a custom cryptographic protocol.

------------------------------------------------------------------------

# 5. Authorization / RBAC

Use role-based authorization.

Recommended roles:

``` text
ADMIN
REFERRAL_OFFICER
HEAD_UNIT
SUBSIDIARY_PROCESSOR
VIEWER
```

Optional SUPER_ADMIN may exist for technical administration.

Authorization must be checked on the server for every protected
mutation.

Example:

``` text
Can user approve referral?
    ↓
Authenticated?
    ↓
Active?
    ↓
Role allows approval?
    ↓
User is assigned to relevant Head Unit?
    ↓
Referral is in PENDING_APPROVAL?
    ↓
Approve
```

Never rely only on:

``` ts
if (role === "HEAD_UNIT") {
  showApproveButton();
}
```

The server must independently reject unauthorized requests.

------------------------------------------------------------------------

# 6. Referral State Machine

Use an explicit state transition service.

Allowed transitions:

``` text
DRAFT
  └── SUBMITTED

SUBMITTED
  └── VALIDATING

VALIDATING
  ├── VALIDATION_FAILED
  └── PENDING_APPROVAL

VALIDATION_FAILED
  └── DRAFT

PENDING_APPROVAL
  ├── APPROVED
  ├── REJECTED
  └── REVISION_REQUIRED

REVISION_REQUIRED
  └── DRAFT

APPROVED
  └── SUBMITTED_TO_SUBSIDIARY

SUBMITTED_TO_SUBSIDIARY
  └── IN_PROCESS

IN_PROCESS
  ├── COMPLETED
  ├── REJECTED
  └── CANCELLED
```

Do not allow arbitrary status updates.

Every transition must:

1.  verify current state,
2.  verify actor permission,
3.  validate required data,
4.  update state,
5.  create timeline event,
6.  create audit event,
7.  create notification when applicable,
8.  execute atomically in a transaction where appropriate.

------------------------------------------------------------------------

# 7. Validation Engine

Create a deterministic validation engine.

Example:

``` ts
type ValidationSeverity = "ERROR" | "WARNING" | "INFO";

interface ValidationResult {
  ruleCode: string;
  severity: ValidationSeverity;
  passed: boolean;
  message: string;
}
```

Example rules:

``` text
REF-001 required referral number
REF-002 target business group required
DOC-001 required KTP uploaded
DOC-002 required KK uploaded
DOC-003 required NPWP uploaded
```

Rules should be configurable in the database when practical.

Do not implement unknown business formulas without a confirmed
requirement.

------------------------------------------------------------------------

# 8. Document Storage

Documents are stored on the server filesystem.

Recommended structure:

``` text
/storage
  /documents
    /{referral-id}
      /{document-id}-{safe-filename}
```

Database stores metadata, not the full binary.

Metadata:

-   original filename,
-   stored filename,
-   MIME type,
-   size,
-   path,
-   checksum,
-   uploader,
-   timestamp.

Security:

-   whitelist extensions,
-   validate MIME type,
-   limit file size,
-   sanitize filename,
-   never execute uploaded content,
-   never construct filesystem paths directly from untrusted input,
-   use generated IDs for stored filenames.

Document download must require authorization.

------------------------------------------------------------------------

# 9. LAN Deployment

Recommended production-like local setup:

``` text
Docker Compose
├── bgr-app
└── postgres
```

Example logical ports:

``` text
BGR: 3000
PostgreSQL: 5432
```

PostgreSQL should preferably bind only to the server/container network,
not expose port 5432 to the office LAN unless required.

Users access:

``` text
http://SERVER_IP:3000
```

Example:

``` text
http://192.168.1.100:3000
```

The server's firewall must allow TCP 3000 from the office LAN.

------------------------------------------------------------------------

# 10. Environment Variables

Required example:

``` env
DATABASE_URL=postgresql://...
AUTH_SECRET=...
APP_URL=http://192.168.1.100:3000
STORAGE_PATH=./storage/documents
```

Create:

``` text
.env.example
```

Never commit real secrets.

------------------------------------------------------------------------

# 11. Database Access

Use Prisma.

All database mutations must go through server-side code.

Use transactions for:

-   referral status transition + timeline + audit,
-   approval + timeline + audit + notification,
-   document metadata update + relevant audit event.

Use indexes for:

-   referral number,
-   status,
-   target business group,
-   creator,
-   created_at,
-   updated_at,
-   notification recipient,
-   audit timestamp.

------------------------------------------------------------------------

# 12. File Upload Flow

``` text
Browser
  ↓
Upload form
  ↓
Server authorization
  ↓
File validation
  ↓
Generate storage name
  ↓
Save file
  ↓
Create Document record
  ↓
Create AuditEvent
```

If DB insertion fails after file save, the implementation must clean up
the orphaned file.

If file save fails, do not create a successful document record.

------------------------------------------------------------------------

# 13. Dashboard Query Rules

Do not load every referral into the browser and calculate metrics
client-side.

Use database aggregation.

Example:

``` text
COUNT total
COUNT by status
COUNT by business group
COUNT by date
```

Apply date filters at query level.

Always define metric semantics.

Example:

``` text
Conversion Rate =
Approved referrals / Submitted referrals
```

Only use this formula if product owner confirms the definition.

If a metric definition is not confirmed, label it clearly or omit it.

------------------------------------------------------------------------

# 14. Pagination

Referral lists must be paginated.

Recommended default:

``` text
20 or 25 rows/page
```

Support:

-   page,
-   page size,
-   search,
-   filters,
-   sorting.

Do not fetch thousands of rows into a browser unnecessarily.

------------------------------------------------------------------------

# 15. Search

Search should use indexed columns where possible.

Primary search:

-   referral number.

Additional search:

-   allowed customer identifier,
-   creator,
-   business group.

Avoid broad unindexed `%term%` queries on large sensitive tables unless
required.

------------------------------------------------------------------------

# 16. Audit Trail

Create a dedicated audit table.

Audit event must be immutable through the normal application.

Minimum fields:

``` text
actor
action
entityType
entityId
oldValue / newValue where useful
metadata
createdAt
```

Do not store full sensitive document contents in audit metadata.

------------------------------------------------------------------------

# 17. Error Handling

Every mutation must return structured errors.

Example:

``` ts
{
  success: false,
  code: "REFERRAL_NOT_EDITABLE",
  message: "Referral sudah tidak dapat diedit pada status ini."
}
```

User-facing messages should be understandable.

Do not expose:

-   stack traces,
-   SQL queries,
-   database credentials,
-   internal filesystem paths.

Log technical details server-side.

------------------------------------------------------------------------

# 18. UI/UX Direction

The supplied mockups use a professional BCA-oriented blue visual
direction.

The implementation should preserve the proposal's general visual intent:

-   professional,
-   corporate,
-   dashboard-oriented,
-   strong blue visual identity,
-   high information density without clutter,
-   clear status colors,
-   clear workflow indicators.

Do not blindly reproduce mockup screenshots pixel-for-pixel.

Use the mockups as visual references.

Core layout:

``` text
┌─────────────────────────────────────────────┐
│ Header / user / notifications              │
├──────────────┬──────────────────────────────┤
│ Sidebar      │ Main content                 │
│              │                              │
│ Dashboard    │ Page                         │
│ Referral     │                              │
│ Approval     │                              │
│ Monitoring   │                              │
│ Analytics    │                              │
│ Documents    │                              │
│ Users        │                              │
│ Settings     │                              │
└──────────────┴──────────────────────────────┘
```

------------------------------------------------------------------------

# 19. Testing

Minimum test layers:

## Unit Tests

Test:

-   status transitions,
-   validation rules,
-   authorization,
-   metric calculations.

## Integration Tests

Test:

-   referral creation,
-   submission,
-   approval,
-   document metadata,
-   audit events.

## E2E

Test the complete happy path:

``` text
Login
→ Create referral
→ Upload document
→ Submit
→ Approve
→ Submit to subsidiary
→ Update processing
→ Dashboard update
```

Also test rejection and revision flows.

------------------------------------------------------------------------

# 20. Backup

At minimum:

``` text
PostgreSQL backup
+
storage/documents backup
```

Backup must be restorable.

A backup that cannot be restored is not considered a valid backup.

------------------------------------------------------------------------

# 21. Production-Like Local Server Checklist

-   fixed LAN IP / DHCP reservation,
-   PostgreSQL running,
-   application running,
-   storage directory writable,
-   firewall allows application port,
-   database not unnecessarily exposed,
-   `.env` configured,
-   backup scheduled/manual procedure documented,
-   server sleep disabled if appropriate,
-   browser access tested from another LAN machine.
