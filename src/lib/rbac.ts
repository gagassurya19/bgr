import { UserRole, ReferralStatus } from "@prisma/client";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessUnitId: string | null;
  businessGroupId: string | null;
};

export function canManageUsers(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canManageBusinessGroups(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN" || role === "REFERRAL_OFFICER";
}

export function canCreateReferral(role: UserRole): boolean {
  return role === "REFERRAL_OFFICER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canApproveReferral(role: UserRole): boolean {
  return role === "HEAD_UNIT" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canProcessReferral(role: UserRole): boolean {
  return role === "SUBSIDIARY_PROCESSOR" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canViewDashboard(): boolean {
  return true;
}

export function canEditReferral(
  role: UserRole,
  userId: string,
  createdById: string,
  status: ReferralStatus,
): boolean {
  const editableStatuses: ReferralStatus[] = ["DRAFT", "VALIDATION_FAILED", "REVISION_REQUIRED"];
  if (!editableStatuses.includes(status)) return false;
  if (role === "ADMIN" || role === "SUPER_ADMIN") return true;
  return role === "REFERRAL_OFFICER" && userId === createdById;
}

export function canSubmitReferral(
  role: UserRole,
  userId: string,
  createdById: string,
  status: ReferralStatus,
): boolean {
  const submittable: ReferralStatus[] = ["DRAFT", "VALIDATION_FAILED", "REVISION_REQUIRED"];
  if (!submittable.includes(status)) return false;
  if (role === "ADMIN" || role === "SUPER_ADMIN") return true;
  return role === "REFERRAL_OFFICER" && userId === createdById;
}
