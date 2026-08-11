# AGENTS.md --- BGR AI Coding Agent Rules

## 0. Mission

You are working on **BGR (Business Group Referral)**, an internal
monolithic web application.

Your job is to implement the product specification accurately, not to
redesign the business process.

The project owner already has a business proposal. The PRD and technical
specification translate that proposal into an implementable software
system.

------------------------------------------------------------------------

# 1. Source of Truth Hierarchy

When making decisions, follow this order:

1.  Explicit instruction in the current user request.
2.  `docs/PRD.md`
3.  `docs/ARCHITECTURE.md` / technical specification
4.  `docs/DATABASE.md`
5.  Existing working code and established project conventions.
6.  General engineering best practices.

If two documents conflict:

-   do not silently choose one,
-   identify the conflict,
-   explain the impact,
-   prefer the higher-priority source.

Never invent a business rule to fill an unknown requirement.

------------------------------------------------------------------------

# 2. Core Product Direction

BGR is:

-   a web application,
-   monolithic,
-   Next.js,
-   TypeScript,
-   PostgreSQL,
-   Prisma,
-   Tailwind CSS,
-   shadcn/ui,
-   deployed on a local office LAN.

Do NOT turn it into:

-   microservices,
-   a mobile app,
-   a PWA-only architecture,
-   a cloud-first architecture,
-   a Supabase-dependent application,
-   an Electron/Tauri desktop app,
-   Kubernetes infrastructure.

The current deployment model is:

``` text
LAN
 |
BGR Server
 ├── Next.js
 ├── PostgreSQL
 └── Local document storage
 |
Users access via browser
```

Internet is not required for normal operation.

------------------------------------------------------------------------

# 3. Before Writing Code

When asked to implement a feature:

1.  Read the relevant PRD section.
2.  Read the relevant technical specification.
3.  Read the relevant database schema.
4.  Inspect the existing repository.
5.  Identify affected files.
6.  Check existing components/services before creating new ones.
7.  Identify authorization requirements.
8.  Identify audit requirements.
9.  Identify state transition requirements.
10. Create a concise implementation plan.

If the task is large, break it into phases.

Do not start by rewriting unrelated files.

------------------------------------------------------------------------

# 4. Do Not Over-Engineer

Prefer the simplest implementation that satisfies the requirement.

Do NOT introduce a new:

-   framework,
-   database,
-   message broker,
-   cache,
-   state-management system,
-   API layer,
-   abstraction layer

unless there is a demonstrated need.

This is a monolith.

Keep it a monolith.

------------------------------------------------------------------------

# 5. Next.js

Use:

-   App Router,
-   Server Components by default,
-   Server Actions or Route Handlers for mutations,
-   Client Components only when interaction requires them.

Do not put secrets or database access in client code.

Do not fetch internal database data through unnecessary client-side API
calls.

------------------------------------------------------------------------

# 6. TypeScript

Rules:

-   strict TypeScript,
-   no `any` unless absolutely unavoidable,
-   prefer explicit domain types,
-   avoid unsafe casts,
-   do not suppress TypeScript errors just to make the build pass.

Bad:

``` ts
const data: any = ...
```

Good:

``` ts
const data: Referral = ...
```

------------------------------------------------------------------------

# 7. Database

Use Prisma + PostgreSQL.

Never:

-   expose DATABASE_URL to the client,
-   query PostgreSQL directly from browser code,
-   manually mutate production schema without migration,
-   bypass authorization for convenience.

Use transactions for business workflows.

------------------------------------------------------------------------

# 8. Business Logic

Business logic belongs in server-side services/actions, not UI
components.

Bad:

``` tsx
// component directly decides whether referral can be approved
```

Better:

``` text
UI
 ↓
approveReferral()
 ↓
authorization
 ↓
state validation
 ↓
database transaction
 ↓
audit + timeline + notification
```

------------------------------------------------------------------------

# 9. Referral State Machine

Never update referral status arbitrarily.

Use a central transition function/service.

Allowed states:

``` text
DRAFT
SUBMITTED
VALIDATING
VALIDATION_FAILED
PENDING_APPROVAL
REVISION_REQUIRED
APPROVED
REJECTED
SUBMITTED_TO_SUBSIDIARY
IN_PROCESS
COMPLETED
CANCELLED
```

Before transition:

1.  verify current status,
2.  verify actor permission,
3.  verify business conditions,
4.  execute transaction,
5.  record status history,
6.  record audit event,
7.  create notification if required.

Never allow:

``` ts
update({ status: arbitraryUserInput })
```

------------------------------------------------------------------------

# 10. Authorization

UI visibility is NOT authorization.

This is insufficient:

``` ts
if (user.role === "HEAD_UNIT") {
  showApproveButton();
}
```

The server must independently verify authorization.

For approval:

``` text
authenticated
AND active
AND correct role
AND correct organizational scope
AND referral is pending approval
```

If any condition fails, reject the operation.

------------------------------------------------------------------------

# 11. Authentication

Never implement custom password hashing or custom cryptography.

Use a proven library.

Passwords must be hashed using a modern password hashing algorithm.

Never log:

-   passwords,
-   session secrets,
-   authentication tokens,
-   database URLs.

------------------------------------------------------------------------

# 12. Validation

Validate input on the server.

Client validation is for UX only.

Use Zod or an equivalent schema validator.

Every mutation should validate:

-   types,
-   required fields,
-   length,
-   format,
-   business constraints.

Return structured errors.

------------------------------------------------------------------------

# 13. Documents

Uploaded files are untrusted.

Always:

-   validate file size,
-   validate MIME type,
-   whitelist file extensions,
-   sanitize names,
-   generate storage filenames,
-   store files outside the public static directory,
-   authorize downloads,
-   record metadata,
-   record uploader,
-   create audit event.

Never use a raw user filename as a filesystem path.

Never allow uploaded files to become executable code.

------------------------------------------------------------------------

# 14. Audit Trail

Important business actions must generate audit events.

At minimum:

``` text
LOGIN
LOGOUT
CREATE
UPDATE
SUBMIT
VALIDATE
APPROVE
REJECT
REQUEST_REVISION
ASSIGN
STATUS_CHANGE
UPLOAD
DOWNLOAD
USER_MANAGEMENT
SETTINGS_CHANGE
```

Audit records are append-only from the application perspective.

Never delete audit records as part of normal CRUD.

------------------------------------------------------------------------

# 15. UI Rules

Use shadcn/ui and Tailwind.

Visual direction:

-   professional corporate application,
-   blue-dominant visual identity inspired by supplied BGR mockups,
-   clean dashboard,
-   readable typography,
-   clear status indicators,
-   consistent spacing,
-   responsive desktop/tablet layout.

Every data page should consider:

-   loading state,
-   empty state,
-   error state,
-   success feedback,
-   pagination,
-   filtering,
-   search,
-   permission-aware actions.

Do not build visually impressive screens that do not have complete
states.

------------------------------------------------------------------------

# 16. Forms

Forms must:

-   have labels,
-   validate inputs,
-   show field-level errors,
-   preserve user input when safe,
-   show submission/loading state,
-   prevent duplicate submission,
-   provide clear success/error feedback.

For destructive actions:

-   use confirmation dialogs,
-   explain consequences,
-   require a reason when the business process requires it.

------------------------------------------------------------------------

# 17. Tables

Tables should:

-   paginate,
-   support useful filters,
-   support sorting where meaningful,
-   have empty states,
-   avoid excessive columns,
-   provide row actions based on permissions.

Do not load the entire dataset into the browser.

------------------------------------------------------------------------

# 18. Dashboard

Dashboard calculations should be done server-side/database-side.

Do not fetch all referrals and calculate metrics in React.

Every metric must have a clearly defined meaning.

If a metric's formula is not specified by the PRD, do not invent a
business definition silently.

------------------------------------------------------------------------

# 19. Error Handling

Never expose internal errors to users.

Do not display:

``` text
PrismaClientKnownRequestError...
```

to end users.

Display:

``` text
Terjadi kesalahan saat menyimpan referral.
Silakan coba lagi.
```

Log technical details server-side.

------------------------------------------------------------------------

# 20. Security

Minimum:

-   secure password hashing,
-   authorization on server,
-   input validation,
-   CSRF protection according to selected auth approach,
-   safe file handling,
-   secure cookies,
-   no secrets in client bundle,
-   no credentials in Git,
-   no sensitive data in logs,
-   audit trail.

Do not claim the application is "enterprise secure" without actual
security review.

------------------------------------------------------------------------

# 21. Environment

Use:

``` text
.env.local
.env.example
```

Example:

``` env
DATABASE_URL=
AUTH_SECRET=
APP_URL=
STORAGE_PATH=
```

Never commit `.env.local`.

------------------------------------------------------------------------

# 22. Testing

Every meaningful business feature should have tests.

Priority:

1.  authorization,
2.  state transitions,
3.  validation,
4.  critical database transactions,
5.  document handling,
6.  dashboard calculations,
7.  happy-path E2E.

Before declaring a task complete, run:

``` bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If scripts differ, inspect `package.json` and use the project's actual
scripts.

Do not claim tests passed if they were not run.

------------------------------------------------------------------------

# 23. Git

Make small, meaningful commits.

Examples:

``` text
feat: add referral creation flow
feat: add referral validation
feat: add head unit approval
feat: add document upload
fix: prevent invalid referral transitions
fix: enforce approval authorization
```

Do not mix unrelated refactors into feature commits.

------------------------------------------------------------------------

# 24. Database Migrations

When changing schema:

1.  update Prisma schema,
2.  create migration,
3.  review migration,
4.  update seed if required,
5.  update relevant tests,
6.  run Prisma validation.

Never delete existing production data to make a migration work.

------------------------------------------------------------------------

# 25. Seed Data

Development seed data must be fake.

Never put real employee credentials into seed scripts.

Use example accounts such as:

``` text
admin@example.local
officer@example.local
approver@example.local
processor@example.local
viewer@example.local
```

Passwords must be development-only and documented as such.

------------------------------------------------------------------------

# 26. Deployment

Target local server:

``` text
Docker Compose
├── bgr-app
└── postgres
```

Client:

``` text
Browser
→ http://SERVER_IP:3000
```

Do not require client machines to install:

-   Node.js,
-   PostgreSQL,
-   Docker,
-   npm,
-   source code.

Only the server machine needs the application runtime.

------------------------------------------------------------------------

# 27. Backup

Document backup and restore.

Backup both:

``` text
PostgreSQL
+
storage/documents
```

Do not claim backup is implemented merely because a backup script
exists.

A restore test should be performed before declaring backup reliable.

------------------------------------------------------------------------

# 28. Handling Ambiguous Requirements

If the PRD says something like:

> "automatic validation"

but does not define the exact validation rule:

DO NOT invent a complex rule.

Instead:

1.  implement the generic validation framework,
2.  use explicitly confirmed rules only,
3.  mark unknown rules as TODO/open decision,
4.  tell the project owner what is missing.

The same applies to:

-   SLA,
-   scoring,
-   conversion rate,
-   document requirements,
-   customer fields,
-   subsidiary integration.

------------------------------------------------------------------------

# 29. No Silent Scope Expansion

Do not add:

-   AI,
-   OCR,
-   WhatsApp integration,
-   email integration,
-   SSO,
-   external API integration,
-   analytics platform,
-   cloud storage,
-   multi-tenant architecture

unless explicitly requested.

The supplied business proposal mentions some of these as
architectural/future concepts, but the MVP is local and self-contained.

------------------------------------------------------------------------

# 30. Definition of Done

A feature is DONE only when:

-   [ ] Requirement understood
-   [ ] Correct route/page exists
-   [ ] UI implemented
-   [ ] Server-side authorization implemented
-   [ ] Server-side validation implemented
-   [ ] Database changes migrated
-   [ ] Loading state implemented
-   [ ] Empty state implemented
-   [ ] Error state implemented
-   [ ] Success feedback implemented
-   [ ] Audit event implemented where applicable
-   [ ] Timeline/status history implemented where applicable
-   [ ] Notifications implemented where applicable
-   [ ] Tests added
-   [ ] TypeScript passes
-   [ ] Lint passes
-   [ ] Build passes
-   [ ] No unrelated regressions

------------------------------------------------------------------------

# 31. Required Agent Behavior

When the user asks:

> "buat fitur X"

Do this:

``` text
1. Read docs.
2. Inspect existing implementation.
3. Explain what files will change.
4. Explain data changes.
5. Implement.
6. Run validation/tests.
7. Review against PRD.
8. Report:
   - changed files
   - behavior
   - tests
   - remaining limitations
```

Do NOT respond with a giant code dump without integrating it into the
actual project.

------------------------------------------------------------------------

# 32. Critical Rule

**Do not optimize for generating the most code. Optimize for
implementing the correct business behavior with the smallest
maintainable change.**

If uncertain, ask or flag the ambiguity.

Never silently invent a requirement.
