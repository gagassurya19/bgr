import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supabase.com")
    ? { rejectUnauthorized: false }
    : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEV_PASSWORD = "Password123!";

async function main() {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  const unit = await prisma.businessUnit.upsert({
    where: { code: "HQ" },
    update: {},
    create: {
      code: "HQ",
      name: "Head Office",
      description: "Kantor pusat",
    },
  });

  const businessGroups = await Promise.all(
    [
      { code: "BCA_FINANCE", name: "BCA Finance", description: "BCA Finance" },
      { code: "BCA_LIFE", name: "BCA Life", description: "BCA Life" },
      { code: "BCA_INSURANCE", name: "BCA Insurance", description: "BCA Insurance" },
      { code: "BCA_DIGITAL", name: "BCA Digital", description: "BCA Digital" },
    ].map((bg) =>
      prisma.businessGroup.upsert({
        where: { code: bg.code },
        update: {},
        create: bg,
      }),
    ),
  );

  const financeGroup = businessGroups[0];

  const users = [
    { email: "admin@example.local", username: "admin", name: "Admin Demo", role: "ADMIN" as const },
    { email: "officer@example.local", username: "officer", name: "Referral Officer", role: "REFERRAL_OFFICER" as const },
    { email: "approver@example.local", username: "approver", name: "Head Unit Approver", role: "HEAD_UNIT" as const },
    {
      email: "processor@example.local",
      username: "processor",
      name: "Subsidiary Processor",
      role: "SUBSIDIARY_PROCESSOR" as const,
      businessGroupId: financeGroup.id,
    },
    { email: "viewer@example.local", username: "viewer", name: "Management Viewer", role: "VIEWER" as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        name: u.name,
        role: u.role,
        status: "ACTIVE",
        businessUnitId: unit.id,
        businessGroupId: "businessGroupId" in u ? u.businessGroupId : null,
      },
      create: {
        email: u.email,
        username: u.username,
        name: u.name,
        role: u.role,
        passwordHash,
        businessUnitId: unit.id,
        businessGroupId: "businessGroupId" in u ? u.businessGroupId : null,
      },
    });
  }

  const docRequirements = [
    { code: "KTP", name: "KTP", isRequired: true, sortOrder: 1 },
    { code: "KK", name: "Kartu Keluarga", isRequired: true, sortOrder: 2 },
    { code: "NPWP", name: "NPWP", isRequired: true, sortOrder: 3 },
    { code: "PBB", name: "PBB / Sertifikat", isRequired: false, sortOrder: 4 },
  ];

  for (const req of docRequirements) {
    await prisma.documentRequirement.upsert({
      where: { businessGroupId_code: { businessGroupId: financeGroup.id, code: req.code } },
      update: { isRequired: req.isRequired, isActive: true },
      create: { ...req, businessGroupId: financeGroup.id },
    });

    if (req.isRequired) {
      await prisma.validationRule.upsert({
        where: { code: `DOC-REQ-${req.code}` },
        update: { name: `${req.name} wajib diunggah`, isActive: true, severity: "ERROR" },
        create: {
          code: `DOC-REQ-${req.code}`,
          name: `${req.name} wajib diunggah`,
          severity: "ERROR",
          isActive: true,
          sortOrder: req.sortOrder + 10,
        },
      });
    }
  }

  const validationRules = [
    { code: "REF-001", name: "Nomor referral wajib", severity: "ERROR" as const, sortOrder: 1 },
    { code: "REF-002", name: "Business group wajib", severity: "ERROR" as const, sortOrder: 2 },
    { code: "REF-003", name: "Nama nasabah wajib", severity: "ERROR" as const, sortOrder: 3 },
  ];

  for (const rule of validationRules) {
    await prisma.validationRule.upsert({
      where: { code: rule.code },
      update: {},
      create: rule,
    });
  }

  console.log("Seed completed.");
  console.log(`Development password for all users: ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
