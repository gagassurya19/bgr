# BGR --- Product Requirements Document (PRD)

## 0. Document Control

-   **Product:** Business Group Referral (BGR)
-   **Document:** Product Requirements Document
-   **Version:** 1.0
-   **Status:** Draft for implementation
-   **Primary source:** Business Group Referral proposal/presentation
    supplied by the project owner
-   **Implementation target:** Local office LAN web application
-   **Language:** Indonesian
-   **Audience:** Product owner, developer, AI coding agent, QA,
    reviewer

> **Source-of-truth rule:** The supplied BGR business proposal is the
> source of truth for business intent, terminology, process framing,
> benefits, and target capabilities. Technical details introduced in
> this document are implementation decisions for the local prototype/MVP
> and must not be interpreted as additional business requirements unless
> explicitly stated.

------------------------------------------------------------------------

# 1. Product Overview

## 1.1 Background

The current referral process is described as manual and fragmented:

-   Referral submissions occur through multiple channels such as
    email/WhatsApp.
-   Documents are spread across different channels/locations.
-   Monitoring is performed manually.
-   Approval can be slow.
-   Human error and data inaccuracies are risks.
-   Information is not available in real time.
-   Reporting and analysis are difficult.

The BGR solution is intended to digitize the referral process into an
integrated end-to-end platform.

The supplied proposal describes BGR as a platform for:

-   end-to-end referral processing,
-   centralized document management,
-   automatic data/document validation,
-   structured Head Unit approval,
-   submission to relevant subsidiary/business group,
-   real-time monitoring/tracking,
-   dashboard analytics,
-   notifications,
-   audit trail,
-   role-based access control,
-   and future integration with subsidiary systems/API Gateway.

## 1.2 Product Vision

Create one internal platform where a referral can be:

**created → completed with required information → documents uploaded →
validated → approved → submitted to the relevant business
group/subsidiary → monitored → analyzed**

while keeping the process transparent, traceable, and auditable.

## 1.3 MVP Deployment Context

The first implementation is a **normal web application deployed on a
local office network**.

Architecture:

``` text
Office Router / LAN
        |
        +-----------------------------+
        |                             |
   BGR Server PC                 Employee PCs
        |                             |
   Next.js + PostgreSQL          Browser
        |
   Local document storage
```

The application must work without public internet access as long as the
server and client computers can communicate over the same LAN.

### Important distinction

"Offline" for this MVP means **no internet dependency**.

It does NOT mean every employee computer runs an independent copy of the
database.

There is one application server and one shared PostgreSQL database.

------------------------------------------------------------------------

# 2. Goals

## 2.1 Primary Goals

1.  Centralize referral submission.
2.  Standardize the referral workflow.
3.  Centralize referral documents.
4.  Reduce manual validation.
5.  Provide structured approval by Head Unit.
6.  Provide status tracking throughout the referral lifecycle.
7.  Provide dashboard analytics and operational visibility.
8.  Record important user actions in an audit trail.
9.  Support role-based access control.
10. Run on a local LAN without requiring internet access.

## 2.2 Business Outcomes

The supplied proposal presents expected outcomes including:

-   faster referral processing,
-   improved productivity,
-   real-time monitoring,
-   increased potential for quality referrals,
-   improved transparency,
-   better collaboration,
-   improved data accuracy,
-   reduced operational effort,
-   better decision making.

The proposal also contains illustrative impact targets such as 45%
time-efficiency improvement, 35% productivity improvement, 100%
monitoring visibility, and 25% potential referral increase. These are
**business targets/illustrations from the proposal**, not software
acceptance criteria.

------------------------------------------------------------------------

# 3. Non-Goals / Out of Scope for MVP

The following are explicitly NOT required for the first local MVP unless
later requested:

1.  Production integration with BCA subsidiary systems.
2.  Real API Gateway integration.
3.  Real SSO integration.
4.  Real corporate identity provider integration.
5.  Public internet deployment.
6.  Cloud deployment.
7.  Mobile native application.
8.  Automatic OCR/AI document extraction unless separately specified.
9.  Automatic external credit checking.
10. Real-time synchronization with external subsidiaries.
11. Multi-office distributed deployment.
12. High-availability production infrastructure.
13. Enterprise-grade disaster recovery infrastructure.
14. External customer-facing portal.

The proposal mentions SSO, API Gateway, encryption, integration, and
future-ready scalability. Those concepts remain part of the
architectural direction, but the first implementation is a
self-contained local LAN system.

------------------------------------------------------------------------

# 4. Target Users

## 4.1 Employee / Referral Officer

Responsible for creating and submitting referrals.

Typical capabilities:

-   create referral,
-   save draft,
-   complete referral form,
-   upload required documents,
-   review validation results,
-   submit referral,
-   view own referral status,
-   respond to revision requests.

## 4.2 Head Unit / Approver

Responsible for reviewing and approving/rejecting referrals.

Capabilities:

-   view referrals requiring approval,
-   inspect referral details,
-   inspect documents,
-   view validation results,
-   approve,
-   reject,
-   request revision,
-   add approval notes,
-   view approval history.

## 4.3 Anak Perusahaan / Business Group Processor

Responsible for receiving referrals after approval.

Capabilities:

-   view submitted referrals,
-   acknowledge/process referral,
-   update processing status,
-   add notes,
-   mark referral completed/rejected according to permitted workflow,
-   view relevant documents.

## 4.4 Admin

Responsible for application administration.

Capabilities:

-   manage users,
-   manage roles,
-   manage business groups,
-   manage Head Unit mappings,
-   manage document requirements,
-   manage system settings,
-   view audit logs.

## 4.5 Viewer / Management

Read-only role for management/monitoring.

Capabilities:

-   dashboard,
-   analytics,
-   referral monitoring,
-   reporting,
-   no mutation operations.

------------------------------------------------------------------------

# 5. Core Business Concepts

## 5.1 Referral

A referral is the primary business transaction in BGR.

A referral contains:

-   unique referral number,
-   creator/referral officer,
-   customer/case information,
-   target business group/subsidiary,
-   referral information,
-   required form data,
-   documents,
-   validation results,
-   approval information,
-   processing status,
-   timeline,
-   audit history.

## 5.2 Business Group / Anak Perusahaan

The destination organization for a referral.

The supplied proposal shows examples such as BCA Finance, BCA Life, BCA
Insurance, BCA Digital, and other business group entities. These
examples should be configurable rather than hard-coded.

## 5.3 Referral Status

The system must use a controlled state machine.

Recommended MVP states:

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

Not every transition is allowed.

## 5.4 Document

A document belongs to a referral.

The proposal's example document list includes:

-   KTP suami/istri
-   KTP
-   KK
-   PBB / Sertifikat
-   NPWP
-   NIB / SIUP
-   Email Aktif
-   Rekening BCA
-   IBS 9430
-   IBS 2210
-   MS Exposure Kredit
-   MyReport
-   Andrea
-   Emergency Contact

This list must be configurable because the actual requirement may differ
by referral/business group.

------------------------------------------------------------------------

# 6. End-to-End Workflow

## 6.1 High-Level Flow

``` text
1. Input Referral
       ↓
2. Upload Formulir Persetujuan Konsumen
       ↓
3. Upload Documents
       ↓
4. Automatic Validation
       ↓
5. Head Unit Approval
       ↓
6. Submit to Anak Perusahaan
       ↓
7. Anak Perusahaan Processing
       ↓
8. Monitoring
       ↓
9. Analytics / Dashboard
```

This follows the workflow shown in the supplied proposal.

## 6.2 Detailed Workflow

### Step 1 --- Create Referral

Referral Officer clicks "Buat Referral".

System:

-   generates referral number,
-   assigns creator,
-   records creation timestamp,
-   initializes status as DRAFT.

### Step 2 --- Complete Referral

User enters required data.

System must:

-   validate required fields,
-   validate formats,
-   preserve draft,
-   prevent submission when mandatory fields are incomplete.

### Step 3 --- Upload Documents

User uploads required documents.

System must:

-   check file type,
-   check file size,
-   associate file with referral,
-   record uploader,
-   record upload timestamp,
-   show document status.

### Step 4 --- Automatic Validation

System checks:

-   required fields,
-   required documents,
-   basic data format,
-   duplicate/consistency rules where defined,
-   document metadata,
-   configurable business validation rules.

The MVP validation engine should be deterministic and explainable.

Each validation result should have:

-   rule,
-   result,
-   severity,
-   message,
-   timestamp.

### Step 5 --- Head Unit Approval

Head Unit sees a queue of referrals awaiting approval.

Approver can:

-   approve,
-   reject,
-   request revision.

Every action must record:

-   actor,
-   action,
-   timestamp,
-   note/reason,
-   previous status,
-   new status.

### Step 6 --- Submit to Subsidiary

After approval, referral is assigned/submitted to the target business
group.

For MVP this is an internal system status transition, not a real
external API integration.

### Step 7 --- Processing

Business Group processor updates the referral:

-   received,
-   in process,
-   completed,
-   rejected/cancelled where permitted.

### Step 8 --- Monitoring

Users with permission can view:

-   current status,
-   age of referral,
-   last update,
-   assigned business group,
-   approval status,
-   processing status,
-   timeline.

### Step 9 --- Analytics

Dashboard provides aggregated operational information.

------------------------------------------------------------------------

# 7. Functional Requirements

## FR-001 Authentication

The application shall require authentication for protected pages.

Minimum MVP:

-   username/email,
-   password,
-   login,
-   logout,
-   session management,
-   password hashing.

## FR-002 Authorization

The application shall enforce role-based access control server-side.

UI hiding alone is not authorization.

## FR-003 User Management

Admin can:

-   create user,
-   edit user,
-   deactivate user,
-   assign role,
-   assign business unit,
-   reset password.

## FR-004 Referral Creation

Authorized referral users can create referrals.

## FR-005 Referral Draft

Users can save incomplete referrals as drafts.

Drafts are not included as active operational referrals unless
explicitly configured.

## FR-006 Referral Submission

System must reject submission when mandatory requirements are not met.

## FR-007 Document Upload

System must support uploading documents associated with referrals.

## FR-008 Document Validation

System must show whether required documents are:

-   missing,
-   uploaded,
-   valid,
-   invalid,
-   requiring revision.

## FR-009 Approval

Head Unit can approve, reject, or request revision.

## FR-010 Approval History

Every approval decision must be preserved.

Do not overwrite historical decisions.

## FR-011 Submission to Business Group

Approved referrals can be submitted to the selected business group.

## FR-012 Processing Status

Business group processor can update permitted processing statuses.

## FR-013 Timeline

Every significant referral event must be visible in chronological order.

## FR-014 Dashboard

Dashboard shall provide:

-   total referrals,
-   approved referrals,
-   pending approvals,
-   rejected referrals,
-   referrals in process,
-   completed referrals,
-   referral trend,
-   referral distribution by business group,
-   recent referrals.

## FR-015 Filtering

Dashboard and referral lists should support filters where applicable:

-   date range,
-   status,
-   business group,
-   creator,
-   approver,
-   referral number.

## FR-016 Audit Trail

System shall record important actions.

Minimum audit events:

-   login,
-   logout,
-   create referral,
-   edit referral,
-   submit referral,
-   upload document,
-   delete/replace document,
-   validation,
-   approve,
-   reject,
-   request revision,
-   assign,
-   status change,
-   user management,
-   settings changes.

## FR-017 Notification

MVP notification can be implemented as in-app notifications.

Email/WhatsApp/push integration is out of scope.

## FR-018 Search

Users with permission can search by:

-   referral number,
-   customer identifier permitted by the business process,
-   status,
-   business group.

## FR-019 Reporting

MVP should provide dashboard-oriented reporting.

Export to CSV/Excel can be added as a subsequent feature unless
explicitly prioritized.

## FR-020 Backup

Admin/server operator must have a documented method to back up:

-   PostgreSQL database,
-   uploaded documents.

------------------------------------------------------------------------

# 8. Non-Functional Requirements

## NFR-001 LAN Availability

The application must work when:

-   server is running,
-   client and server are connected to the same LAN,
-   internet is unavailable.

## NFR-002 Performance

Target:

-   normal page navigation under 2 seconds on local LAN under normal
    load,
-   list pages should use pagination,
-   dashboard queries should use indexed columns and reasonable
    aggregation.

These are engineering targets, not measured production guarantees.

## NFR-003 Security

Minimum:

-   passwords must be hashed,
-   authorization must be enforced server-side,
-   database credentials must not be exposed to browsers,
-   uploaded files must not be executable,
-   input must be validated,
-   sensitive actions must be audited,
-   secrets must be stored in environment variables.

## NFR-004 Data Integrity

-   Use database transactions for multi-step mutations.
-   Use foreign keys.
-   Use unique constraints where business identifiers require
    uniqueness.
-   Do not hard-delete critical business records by default.
-   Preserve audit history.

## NFR-005 Maintainability

-   TypeScript strict mode.
-   Clear domain boundaries.
-   Reusable components.
-   No unnecessary abstraction.
-   No microservices.

## NFR-006 Accessibility

Minimum:

-   keyboard-accessible controls,
-   visible focus states,
-   readable contrast,
-   semantic form labels,
-   meaningful error messages.

## NFR-007 Responsive UI

The application should work on desktop and tablet-sized screens.

Primary target is desktop because this is an internal office
application.

------------------------------------------------------------------------

# 9. Dashboard Requirements

The supplied proposal/mockups show KPI cards, referral trends, status
distribution, business group performance, and recent referral
information.

Suggested KPI cards:

1.  Total Referral
2.  Pending Approval
3.  Approved
4.  In Process
5.  Completed
6.  Rejected
7.  Conversion Rate

Dashboard should support a date range filter.

All metrics must clearly state their time range.

Do not present percentages without defining numerator and denominator.

------------------------------------------------------------------------

# 10. Audit Requirements

Audit records must be append-oriented.

Each audit record should contain:

-   actor,
-   action,
-   entity type,
-   entity ID,
-   timestamp,
-   metadata,
-   optional IP address,
-   optional user agent.

For important status changes, store:

-   old status,
-   new status,
-   reason/note.

Audit logs must not be editable through normal UI.

------------------------------------------------------------------------

# 11. Acceptance Criteria

A feature is considered complete only when:

-   business behavior matches this PRD,
-   unauthorized users cannot execute the operation,
-   validation works,
-   loading state exists,
-   empty state exists,
-   error state exists,
-   success feedback exists,
-   relevant audit event exists,
-   database constraints exist where required,
-   TypeScript passes,
-   lint passes,
-   build passes,
-   relevant tests pass.

------------------------------------------------------------------------

# 12. MVP Definition

MVP is complete when the following end-to-end scenario works:

``` text
Referral Officer logs in
    ↓
Creates referral
    ↓
Saves referral
    ↓
Uploads required documents
    ↓
System validates required data/documents
    ↓
Referral submitted
    ↓
Head Unit receives approval task
    ↓
Head Unit reviews
    ↓
Head Unit approves
    ↓
Referral submitted to target business group
    ↓
Business group processor receives it
    ↓
Processor updates status
    ↓
Management can monitor the referral
    ↓
Dashboard reflects the transaction
    ↓
Audit trail shows all major events
```

------------------------------------------------------------------------

# 13. Open Decisions

The following are not fully defined by the supplied business material
and must NOT be silently invented:

-   exact customer data fields,
-   exact referral scoring rules,
-   exact validation formulas,
-   exact SLA durations per stage,
-   exact document requirements per business group,
-   exact business group list,
-   exact organizational hierarchy,
-   exact SSO provider,
-   exact API Gateway contract,
-   exact external subsidiary API contracts,
-   exact notification channels,
-   exact retention period,
-   exact compliance requirements,
-   exact production hosting architecture.

For MVP, these must be represented as configurable or explicitly
documented assumptions.

------------------------------------------------------------------------

# 14. Source-Derived Product Principles

The supplied proposal repeatedly positions BGR around:

-   integration,
-   automation,
-   transparency,
-   real-time tracking,
-   centralized documents,
-   structured approval,
-   analytics,
-   auditability,
-   collaboration across business groups.

The implementation must preserve those principles even when technical
implementation details change.
