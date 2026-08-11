# BGR --- Database Schema

## 0. Database Strategy

Database:

**PostgreSQL**

ORM:

**Prisma**

Database is shared by the BGR application server.

The schema below represents the recommended MVP domain model. Fields
whose exact business meaning is not defined in the supplied proposal are
intentionally generic/configurable.

------------------------------------------------------------------------

# 1. Entity Relationship Overview

``` text
User
 ├── Role
 ├── BusinessUnit
 └── many Referral

Referral
 ├── BusinessGroup
 ├── Creator(User)
 ├── Documents
 ├── ValidationRuns
 ├── Approvals
 ├── StatusHistory
 ├── Notifications
 └── AuditEvents

BusinessGroup
 ├── Users
 └── Referrals

DocumentRequirement
 └── BusinessGroup (optional)

ReferralDocument
 ├── Referral
 └── DocumentRequirement (optional)

ValidationRun
 └── ValidationResult

Approval
 └── User

Notification
 └── User

AuditEvent
 └── User
```

------------------------------------------------------------------------

# 2. Enumerations

Recommended Prisma enums:

``` prisma
enum UserStatus {
  ACTIVE
  INACTIVE
}

enum UserRole {
  ADMIN
  REFERRAL_OFFICER
  HEAD_UNIT
  SUBSIDIARY_PROCESSOR
  VIEWER
  SUPER_ADMIN
}

enum ReferralStatus {
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
}

enum ValidationSeverity {
  ERROR
  WARNING
  INFO
}

enum ValidationRunStatus {
  RUNNING
  PASSED
  FAILED
  COMPLETED_WITH_WARNING
}

enum ApprovalDecision {
  APPROVED
  REJECTED
  REVISION_REQUIRED
}

enum DocumentStatus {
  REQUIRED
  UPLOADED
  VALID
  INVALID
  REQUIRES_REVISION
}

enum NotificationType {
  REFERRAL_SUBMITTED
  APPROVAL_REQUIRED
  REFERRAL_APPROVED
  REFERRAL_REJECTED
  REVISION_REQUIRED
  REFERRAL_ASSIGNED
  STATUS_CHANGED
  SYSTEM
}

enum AuditAction {
  LOGIN
  LOGOUT
  CREATE
  UPDATE
  DELETE
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
}

enum EntityType {
  USER
  REFERRAL
  DOCUMENT
  APPROVAL
  BUSINESS_GROUP
  VALIDATION_RUN
  SYSTEM
}
```

------------------------------------------------------------------------

# 3. User

Purpose:

Stores application users.

Recommended fields:

``` text
id
name
email
username
passwordHash
role
status
businessUnitId
lastLoginAt
createdAt
updatedAt
```

Rules:

-   email or username must be unique,
-   passwordHash only stores a secure password hash,
-   inactive users cannot log in,
-   do not hard-delete users that have historical activity.

------------------------------------------------------------------------

# 4. BusinessUnit

Represents internal organizational unit.

Fields:

``` text
id
code
name
description
isActive
createdAt
updatedAt
```

Examples must be configurable.

------------------------------------------------------------------------

# 5. BusinessGroup

Represents referral destination / anak perusahaan.

Fields:

``` text
id
code
name
description
isActive
createdAt
updatedAt
```

Examples from the proposal include BCA Finance, BCA Life, BCA Insurance,
BCA Digital, etc. They must be seed/configuration data, not hard-coded
application logic.

------------------------------------------------------------------------

# 6. Referral

This is the primary transaction table.

Recommended fields:

``` text
id UUID
referralNumber VARCHAR UNIQUE
createdById UUID
businessGroupId UUID
status ReferralStatus

customerName
customerIdentifier
customerEmail
customerPhone

subject
description

submittedAt
approvedAt
completedAt

createdAt
updatedAt
```

Important:

Customer fields above are intentionally generic. The exact customer data
requirements must be confirmed before implementation.

Indexes:

``` text
referralNumber
status
createdById
businessGroupId
createdAt
updatedAt
```

------------------------------------------------------------------------

# 7. ReferralDocument

Stores metadata for uploaded files.

Fields:

``` text
id UUID
referralId UUID
requirementId UUID nullable

originalFilename
storedFilename
storagePath

mimeType
fileSize
checksum

status DocumentStatus

uploadedById
uploadedAt
updatedAt
```

Rules:

-   storedFilename should be generated, not trusted from user input,
-   checksum should be used to identify exact file content,
-   deletion should normally be soft/deactivated for audit-sensitive
    documents,
-   download must be authorized.

------------------------------------------------------------------------

# 8. DocumentRequirement

Configurable document requirement.

Fields:

``` text
id UUID
businessGroupId UUID nullable

code
name
description

isRequired
isActive
sortOrder

createdAt
updatedAt
```

This allows different business groups to require different documents.

Examples from proposal material can be seeded as requirements, but must
be reviewed before production use.

------------------------------------------------------------------------

# 9. ValidationRule

Represents an automated validation rule.

Fields:

``` text
id UUID
code
name
description
severity
isActive
sortOrder
configuration JSONB

createdAt
updatedAt
```

Example:

``` text
DOC-KTP-REQUIRED
DOC-KK-REQUIRED
REF-BUSINESS-GROUP-REQUIRED
```

Do not encode unconfirmed business rules as facts.

------------------------------------------------------------------------

# 10. ValidationRun

Represents one validation execution for a referral.

Fields:

``` text
id UUID
referralId UUID
status ValidationRunStatus

startedAt
completedAt
triggeredById nullable
```

Each submission can create a new validation run.

Never overwrite old validation runs.

------------------------------------------------------------------------

# 11. ValidationResult

Individual rule result.

Fields:

``` text
id UUID
validationRunId UUID
ruleId UUID

passed
severity
message

createdAt
```

Example:

``` text
Rule: DOC-KTP-REQUIRED
Passed: false
Severity: ERROR
Message: "KTP belum diunggah."
```

------------------------------------------------------------------------

# 12. Approval

Stores approval decision.

Fields:

``` text
id UUID
referralId UUID
approverId UUID

decision ApprovalDecision
note

decidedAt
createdAt
```

Approval history is append-only.

If a referral is revised and resubmitted, create a new approval record.

------------------------------------------------------------------------

# 13. ReferralStatusHistory

Stores status timeline.

Fields:

``` text
id UUID
referralId UUID

fromStatus nullable
toStatus

changedById
note

createdAt
```

This is separate from AuditEvent because the referral timeline is a
domain feature, while AuditEvent is the security/accountability log.

------------------------------------------------------------------------

# 14. ReferralAssignment

Tracks responsibility/assignment.

Fields:

``` text
id UUID
referralId UUID
assignedToUserId nullable
businessGroupId nullable

assignedById
assignedAt

unassignedAt nullable
```

Only create this table if assignment behavior is required by the
approved workflow. It is recommended because the proposal includes
submission and processing by business groups.

------------------------------------------------------------------------

# 15. Notification

In-app notification.

Fields:

``` text
id UUID
recipientId UUID
type NotificationType

title
message

referralId nullable

isRead
readAt nullable

createdAt
```

MVP does not require email/WhatsApp delivery.

------------------------------------------------------------------------

# 16. AuditEvent

Security/accountability log.

Fields:

``` text
id UUID

actorId nullable
action AuditAction
entityType EntityType
entityId nullable

oldData JSONB nullable
newData JSONB nullable
metadata JSONB nullable

ipAddress nullable
userAgent nullable

createdAt
```

Rules:

-   append only,
-   no normal UI editing,
-   avoid storing secrets,
-   avoid storing full document binaries,
-   do not put passwords or authentication tokens into metadata.

------------------------------------------------------------------------

# 17. SystemSetting

Optional configurable system settings.

Fields:

``` text
id UUID
key UNIQUE
value JSONB
description
updatedById
createdAt
updatedAt
```

Use only for non-secret configuration.

Secrets must remain environment variables.

------------------------------------------------------------------------

# 18. Recommended Prisma Schema Skeleton

``` prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String     @id @default(uuid())
  name           String
  email          String     @unique
  username       String     @unique
  passwordHash   String
  role           UserRole
  status         UserStatus @default(ACTIVE)

  businessUnitId String?
  businessUnit   BusinessUnit? @relation(fields: [businessUnitId], references: [id])

  referralsCreated Referral[] @relation("ReferralCreator")
  approvals         Approval[]
  auditEvents       AuditEvent[]
  notifications     Notification[]
  assignments       ReferralAssignment[] @relation("AssignmentUser")

  lastLoginAt DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([role])
  @@index([status])
  @@index([businessUnitId])
}

model BusinessUnit {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  description String?
  isActive    Boolean  @default(true)

  users User[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BusinessGroup {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  description String?
  isActive    Boolean  @default(true)

  referrals Referral[]
  users     User[]
  documentRequirements DocumentRequirement[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Referral {
  id               String         @id @default(uuid())
  referralNumber   String         @unique
  createdById      String
  businessGroupId  String
  status           ReferralStatus @default(DRAFT)

  customerName       String?
  customerIdentifier String?
  customerEmail      String?
  customerPhone      String?

  subject     String?
  description String?

  submittedAt DateTime?
  approvedAt  DateTime?
  completedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  createdBy     User @relation("ReferralCreator", fields: [createdById], references: [id])
  businessGroup BusinessGroup @relation(fields: [businessGroupId], references: [id])

  documents      ReferralDocument[]
  validationRuns ValidationRun[]
  approvals      Approval[]
  statusHistory  ReferralStatusHistory[]
  assignments    ReferralAssignment[]
  notifications  Notification[]
  auditEvents    AuditEvent[]

  @@index([status])
  @@index([createdById])
  @@index([businessGroupId])
  @@index([createdAt])
  @@index([updatedAt])
}

model DocumentRequirement {
  id             String  @id @default(uuid())
  businessGroupId String?
  code           String
  name           String
  description    String?
  isRequired     Boolean @default(true)
  isActive       Boolean @default(true)
  sortOrder      Int     @default(0)

  businessGroup BusinessGroup? @relation(fields: [businessGroupId], references: [id])
  documents     ReferralDocument[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([businessGroupId, code])
  @@index([businessGroupId])
}

model ReferralDocument {
  id             String         @id @default(uuid())
  referralId     String
  requirementId  String?

  originalFilename String
  storedFilename   String
  storagePath      String
  mimeType         String
  fileSize         BigInt
  checksum         String

  status       DocumentStatus @default(UPLOADED)
  uploadedById String
  uploadedAt   DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  referral    Referral @relation(fields: [referralId], references: [id])
  requirement DocumentRequirement? @relation(fields: [requirementId], references: [id])
  uploadedBy  User @relation(fields: [uploadedById], references: [id])

  @@index([referralId])
  @@index([requirementId])
  @@index([status])
}

model ValidationRule {
  id          String             @id @default(uuid())
  code        String             @unique
  name        String
  description String?
  severity    ValidationSeverity
  isActive    Boolean            @default(true)
  sortOrder   Int                @default(0)
  configuration Json?

  results ValidationResult[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ValidationRun {
  id            String             @id @default(uuid())
  referralId    String
  status        ValidationRunStatus
  startedAt     DateTime           @default(now())
  completedAt   DateTime?
  triggeredById String?

  referral  Referral @relation(fields: [referralId], references: [id])
  results   ValidationResult[]
  triggeredBy User? @relation(fields: [triggeredById], references: [id])

  @@index([referralId])
  @@index([status])
}

model ValidationResult {
  id             String             @id @default(uuid())
  validationRunId String
  ruleId          String
  passed         Boolean
  severity       ValidationSeverity
  message        String
  createdAt      DateTime @default(now())

  validationRun ValidationRun @relation(fields: [validationRunId], references: [id])
  rule           ValidationRule @relation(fields: [ruleId], references: [id])

  @@index([validationRunId])
  @@index([ruleId])
}

model Approval {
  id         String           @id @default(uuid())
  referralId String
  approverId String
  decision   ApprovalDecision
  note       String?
  decidedAt  DateTime         @default(now())
  createdAt  DateTime         @default(now())

  referral Referral @relation(fields: [referralId], references: [id])
  approver User     @relation(fields: [approverId], references: [id])

  @@index([referralId])
  @@index([approverId])
}

model ReferralStatusHistory {
  id         String         @id @default(uuid())
  referralId String
  fromStatus ReferralStatus?
  toStatus   ReferralStatus
  changedById String
  note       String?
  createdAt  DateTime       @default(now())

  referral Referral @relation(fields: [referralId], references: [id])
  changedBy User @relation(fields: [changedById], references: [id])

  @@index([referralId])
  @@index([createdAt])
}

model ReferralAssignment {
  id              String    @id @default(uuid())
  referralId      String
  assignedToUserId String?
  businessGroupId String?
  assignedById    String
  assignedAt      DateTime  @default(now())
  unassignedAt    DateTime?

  referral       Referral      @relation(fields: [referralId], references: [id])
  assignedToUser User?        @relation("AssignmentUser", fields: [assignedToUserId], references: [id])
  assignedBy     User         @relation("AssignmentActor", fields: [assignedById], references: [id])

  @@index([referralId])
  @@index([assignedToUserId])
  @@index([businessGroupId])
}

model Notification {
  id          String           @id @default(uuid())
  recipientId String
  type        NotificationType
  title       String
  message     String
  referralId  String?
  isRead      Boolean          @default(false)
  readAt      DateTime?
  createdAt   DateTime         @default(now())

  recipient User @relation(fields: [recipientId], references: [id])
  referral  Referral? @relation(fields: [referralId], references: [id])

  @@index([recipientId, isRead])
  @@index([createdAt])
}

model AuditEvent {
  id         String     @id @default(uuid())
  actorId    String?
  action     AuditAction
  entityType EntityType
  entityId   String?

  oldData Json?
  newData Json?
  metadata Json?

  ipAddress String?
  userAgent String?

  referralId String?
  createdAt  DateTime @default(now())

  actor    User?     @relation(fields: [actorId], references: [id])
  referral Referral? @relation(fields: [referralId], references: [id])

  @@index([actorId])
  @@index([entityType, entityId])
  @@index([createdAt])
  @@index([referralId])
}
```

> The skeleton is intentionally a starting point. The coding agent must
> run Prisma validation and resolve missing relation-name details before
> migration. Do not blindly copy it into production without validating
> the generated Prisma schema.

------------------------------------------------------------------------

# 19. Data Integrity Rules

1.  Referral number unique.
2.  Business group code unique.
3.  User email unique.
4.  User username unique.
5.  Validation rule code unique.
6.  Document requirement code unique within its applicable business
    group.
7.  Referral status transitions only through service layer.
8.  Approval records are append-only.
9.  Audit events are append-only.
10. Critical records should not be hard-deleted.
11. Use foreign keys.
12. Use transactions for state-changing workflows.

------------------------------------------------------------------------

# 20. Seed Data

Development seed should include:

### Roles

``` text
SUPER_ADMIN
ADMIN
REFERRAL_OFFICER
HEAD_UNIT
SUBSIDIARY_PROCESSOR
VIEWER
```

### Example business groups

Use only values approved by the product owner. Proposal examples may be
seeded for prototype/demo purposes:

``` text
BCA_FINANCE
BCA_LIFE
BCA_INSURANCE
BCA_DIGITAL
```

Do not assume this is the complete official list.

### Example users

Use clearly fake development accounts.

Never seed real employee passwords.

------------------------------------------------------------------------

# 21. Migration Policy

Use:

``` bash
npx prisma migrate dev
```

for development.

Use:

``` bash
npx prisma migrate deploy
```

for deployment.

Never modify the production schema manually when the change should be
represented as a migration.
