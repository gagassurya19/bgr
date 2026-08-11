"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import { auditService } from "@/services/audit.service";
import { failure, success, type ActionResult } from "@/lib/errors";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    return success(undefined);
  } catch (error) {
    if (error instanceof AuthError) {
      return failure("INVALID_CREDENTIALS", "Email atau password salah.");
    }
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  const session = await auth();
  if (session?.user?.id) {
    await auditService.log({
      actorId: session.user.id,
      action: "LOGOUT",
      entityType: "USER",
      entityId: session.user.id,
    });
  }
  await signOut({ redirectTo: "/login" });
}

export async function switchDemoAccountAction(email: string): Promise<void> {
  const session = await auth();
  if (session?.user?.id) {
    await auditService.log({
      actorId: session.user.id,
      action: "LOGOUT",
      entityType: "USER",
      entityId: session.user.id,
    });
  }
  await signOut({ redirectTo: `/login?email=${encodeURIComponent(email)}` });
}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}
