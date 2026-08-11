# BGR - Business Group Referral

Monolithic internal web application for managing business group referrals on a local office LAN.

## Stack

- Next.js (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- Tailwind CSS
- NextAuth (credentials) + bcrypt

## Quick Start (Development)

### 1. Environment

Copy `.env.example` to `.env.local` and adjust values:

```bash
cp .env.example .env.local
```

### 2. Start PostgreSQL (Docker)

```bash
docker compose up -d postgres
```

### 3. Database setup

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Run app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@example.local | Password123! | ADMIN |
| officer@example.local | Password123! | REFERRAL_OFFICER |
| approver@example.local | Password123! | HEAD_UNIT |
| processor@example.local | Password123! | SUBSIDIARY_PROCESSOR |
| viewer@example.local | Password123! | VIEWER |

## LAN Deployment

Users access the app via browser:

```text
http://SERVER_IP:3000
```

Run full stack with Docker Compose:

```bash
docker compose up -d
```

## Backup

Backup both:

1. PostgreSQL database
2. `storage/documents/` folder

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check
- `npm run test` — unit tests
- `npm run db:migrate` — run migrations
- `npm run db:seed` — seed development data

## Spec Documents

See `spec/` folder for PRD, technical specification, database schema, and agent rules.
