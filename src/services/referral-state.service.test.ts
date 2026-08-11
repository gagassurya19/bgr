import { describe, expect, it } from "vitest";
import { referralStateService, getAllowedTransitions } from "@/services/referral-state.service";

describe("referralStateService", () => {
  it("allows DRAFT to SUBMITTED for referral officer", () => {
    expect(referralStateService.canTransition("DRAFT", "SUBMITTED", "REFERRAL_OFFICER")).toBe(true);
  });

  it("denies arbitrary status updates", () => {
    expect(referralStateService.canTransition("DRAFT", "APPROVED", "REFERRAL_OFFICER")).toBe(false);
  });

  it("allows head unit to approve from pending approval", () => {
    expect(referralStateService.canTransition("PENDING_APPROVAL", "APPROVED", "HEAD_UNIT")).toBe(true);
  });

  it("returns allowed transitions for current status", () => {
    const transitions = getAllowedTransitions("PENDING_APPROVAL", "HEAD_UNIT");
    expect(transitions).toContain("APPROVED");
    expect(transitions).toContain("REJECTED");
    expect(transitions).toContain("REVISION_REQUIRED");
  });

  it("allows resubmit after revision for referral officer", () => {
    expect(referralStateService.canTransition("REVISION_REQUIRED", "SUBMITTED", "REFERRAL_OFFICER")).toBe(true);
  });

  it("allows resubmit after validation failed for referral officer", () => {
    expect(referralStateService.canTransition("VALIDATION_FAILED", "SUBMITTED", "REFERRAL_OFFICER")).toBe(true);
  });

  it("throws on invalid transition", () => {
    expect(() =>
      referralStateService.assertTransition("COMPLETED", "DRAFT", "REFERRAL_OFFICER"),
    ).toThrow("Transisi status");
  });
});
