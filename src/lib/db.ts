import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool, type PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  poolConnectionString: string | undefined;
};

function createPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const isSupabase = connectionString.includes("supabase.com");

  return {
    connectionString,
    max: isSupabase ? 1 : 10,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  };
}

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL ?? "";

  if (
    globalForPrisma.pool &&
    globalForPrisma.poolConnectionString &&
    globalForPrisma.poolConnectionString !== connectionString
  ) {
    void globalForPrisma.pool.end();
    globalForPrisma.pool = undefined;
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool(createPoolConfig());
    globalForPrisma.poolConnectionString = connectionString;
  }

  return globalForPrisma.pool;
}

function createPrismaClient() {
  const pool = getPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
