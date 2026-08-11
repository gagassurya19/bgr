import { prisma } from "@/lib/db";

export async function generateReferralNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `BGR-${year}${month}`;

  const count = await prisma.referral.count({
    where: {
      referralNumber: { startsWith: prefix },
    },
  });

  const sequence = String(count + 1).padStart(4, "0");
  return `${prefix}-${sequence}`;
}
