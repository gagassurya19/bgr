import { ValidationSeverity } from "@prisma/client";
import { prisma } from "@/lib/db";

export type ValidationResultItem = {
  ruleCode: string;
  severity: ValidationSeverity;
  passed: boolean;
  message: string;
};

export const validationService = {
  async runValidation(referralId: string, triggeredById?: string) {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: {
        documents: { include: { requirement: true } },
        businessGroup: true,
      },
    });

    if (!referral) {
      throw new Error("Referral tidak ditemukan.");
    }

    const rules = await prisma.validationRule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    const results: ValidationResultItem[] = [];

    for (const rule of rules) {
      const result = evaluateRule(rule.code, referral);
      results.push(result);
    }

    const hasError = results.some((r) => !r.passed && r.severity === "ERROR");
    const hasWarning = results.some((r) => !r.passed && r.severity === "WARNING");

    const run = await prisma.$transaction(async (tx) => {
      const validationRun = await tx.validationRun.create({
        data: {
          referralId,
          triggeredById: triggeredById ?? null,
          status: hasError ? "FAILED" : hasWarning ? "COMPLETED_WITH_WARNING" : "PASSED",
          completedAt: new Date(),
        },
      });

      for (const result of results) {
        const rule = rules.find((r) => r.code === result.ruleCode);
        if (!rule) continue;
        await tx.validationResult.create({
          data: {
            validationRunId: validationRun.id,
            ruleId: rule.id,
            passed: result.passed,
            severity: result.severity,
            message: result.message,
          },
        });
      }

      return validationRun;
    });

    return { run, results, hasError, hasWarning };
  },
};

type ReferralWithDocs = Awaited<
  ReturnType<typeof prisma.referral.findUnique>
> & {
  documents: Array<{ requirement: { code: string } | null }>;
  businessGroup: { id: string; name: string };
};

function evaluateRule(code: string, referral: NonNullable<ReferralWithDocs>): ValidationResultItem {
  switch (code) {
    case "REF-001":
      return {
        ruleCode: code,
        severity: "ERROR",
        passed: !!referral.referralNumber,
        message: referral.referralNumber
          ? "Nomor referral valid."
          : "Nomor referral wajib diisi.",
      };
    case "REF-002":
      return {
        ruleCode: code,
        severity: "ERROR",
        passed: !!referral.businessGroupId,
        message: referral.businessGroupId
          ? "Business group telah dipilih."
          : "Business group tujuan wajib dipilih.",
      };
    case "REF-003":
      return {
        ruleCode: code,
        severity: "ERROR",
        passed: !!referral.customerName?.trim(),
        message: referral.customerName?.trim()
          ? "Nama nasabah telah diisi."
          : "Nama nasabah wajib diisi.",
      };
    default: {
      if (code.startsWith("DOC-REQ-")) {
        const reqCode = code.slice("DOC-REQ-".length);
        const hasDoc = referral.documents.some((d) => d.requirement?.code === reqCode);
        return {
          ruleCode: code,
          severity: "ERROR",
          passed: hasDoc,
          message: hasDoc
            ? `Dokumen ${reqCode} telah diunggah.`
            : `Dokumen ${reqCode} belum diunggah.`,
        };
      }

      // Legacy seed rules
      if (code === "DOC-001") {
        const hasKtp = referral.documents.some((d) => d.requirement?.code === "KTP");
        return {
          ruleCode: code,
          severity: "ERROR",
          passed: hasKtp,
          message: hasKtp ? "Dokumen KTP telah diunggah." : "Dokumen KTP belum diunggah.",
        };
      }
      if (code === "DOC-002") {
        const hasKk = referral.documents.some((d) => d.requirement?.code === "KK");
        return {
          ruleCode: code,
          severity: "ERROR",
          passed: hasKk,
          message: hasKk ? "Dokumen KK telah diunggah." : "Dokumen KK belum diunggah.",
        };
      }
      if (code === "DOC-003") {
        const hasNpwp = referral.documents.some((d) => d.requirement?.code === "NPWP");
        return {
          ruleCode: code,
          severity: "ERROR",
          passed: hasNpwp,
          message: hasNpwp ? "Dokumen NPWP telah diunggah." : "Dokumen NPWP belum diunggah.",
        };
      }

      return {
        ruleCode: code,
        severity: "INFO",
        passed: true,
        message: "Aturan belum dikonfigurasi.",
      };
    }
  }
}
