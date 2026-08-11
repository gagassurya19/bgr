import { ReferralStatus, UserRole } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { canApproveReferral, canProcessReferral } from "@/lib/rbac";

type Transition = {
  from: ReferralStatus;
  to: ReferralStatus;
  allowedRoles: UserRole[];
};

const TRANSITIONS: Transition[] = [
  { from: "DRAFT", to: "SUBMITTED", allowedRoles: ["REFERRAL_OFFICER", "ADMIN", "SUPER_ADMIN"] },
  { from: "VALIDATION_FAILED", to: "SUBMITTED", allowedRoles: ["REFERRAL_OFFICER", "ADMIN", "SUPER_ADMIN"] },
  { from: "REVISION_REQUIRED", to: "SUBMITTED", allowedRoles: ["REFERRAL_OFFICER", "ADMIN", "SUPER_ADMIN"] },
  { from: "SUBMITTED", to: "VALIDATING", allowedRoles: ["REFERRAL_OFFICER", "ADMIN", "SUPER_ADMIN", "HEAD_UNIT"] },
  { from: "VALIDATING", to: "VALIDATION_FAILED", allowedRoles: ["REFERRAL_OFFICER", "ADMIN", "SUPER_ADMIN", "HEAD_UNIT"] },
  { from: "VALIDATING", to: "PENDING_APPROVAL", allowedRoles: ["REFERRAL_OFFICER", "ADMIN", "SUPER_ADMIN", "HEAD_UNIT"] },
  { from: "VALIDATION_FAILED", to: "DRAFT", allowedRoles: ["REFERRAL_OFFICER", "ADMIN", "SUPER_ADMIN"] },
  { from: "PENDING_APPROVAL", to: "APPROVED", allowedRoles: ["HEAD_UNIT", "ADMIN", "SUPER_ADMIN"] },
  { from: "PENDING_APPROVAL", to: "REJECTED", allowedRoles: ["HEAD_UNIT", "ADMIN", "SUPER_ADMIN"] },
  { from: "PENDING_APPROVAL", to: "REVISION_REQUIRED", allowedRoles: ["HEAD_UNIT", "ADMIN", "SUPER_ADMIN"] },
  { from: "REVISION_REQUIRED", to: "DRAFT", allowedRoles: ["REFERRAL_OFFICER", "ADMIN", "SUPER_ADMIN"] },
  { from: "APPROVED", to: "SUBMITTED_TO_SUBSIDIARY", allowedRoles: ["HEAD_UNIT", "ADMIN", "SUPER_ADMIN", "SUBSIDIARY_PROCESSOR"] },
  { from: "SUBMITTED_TO_SUBSIDIARY", to: "IN_PROCESS", allowedRoles: ["SUBSIDIARY_PROCESSOR", "ADMIN", "SUPER_ADMIN"] },
  { from: "IN_PROCESS", to: "COMPLETED", allowedRoles: ["SUBSIDIARY_PROCESSOR", "ADMIN", "SUPER_ADMIN"] },
  { from: "IN_PROCESS", to: "REJECTED", allowedRoles: ["SUBSIDIARY_PROCESSOR", "ADMIN", "SUPER_ADMIN"] },
  { from: "IN_PROCESS", to: "CANCELLED", allowedRoles: ["SUBSIDIARY_PROCESSOR", "ADMIN", "SUPER_ADMIN"] },
];

export const referralStateService = {
  canTransition(from: ReferralStatus, to: ReferralStatus, role: UserRole): boolean {
    return TRANSITIONS.some(
      (t) => t.from === from && t.to === to && t.allowedRoles.includes(role),
    );
  },

  assertTransition(from: ReferralStatus, to: ReferralStatus, role: UserRole): void {
    if (!this.canTransition(from, to, role)) {
      throw new AppError(
        "INVALID_STATUS_TRANSITION",
        `Transisi status dari ${from} ke ${to} tidak diizinkan.`,
      );
    }
  },

  assertApprovalAction(role: UserRole): void {
    if (!canApproveReferral(role)) {
      throw new AppError("UNAUTHORIZED", "Anda tidak memiliki izin untuk melakukan persetujuan.");
    }
  },

  assertProcessingAction(role: UserRole): void {
    if (!canProcessReferral(role)) {
      throw new AppError("UNAUTHORIZED", "Anda tidak memiliki izin untuk memproses referral.");
    }
  },
};

export function getAllowedTransitions(
  current: ReferralStatus,
  role: UserRole,
): ReferralStatus[] {
  return TRANSITIONS.filter((t) => t.from === current && t.allowedRoles.includes(role)).map(
    (t) => t.to,
  );
}
