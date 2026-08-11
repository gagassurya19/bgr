import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const unreadNotificationCount = await getUnreadNotificationCount(session.user.id);

  return (
    <AppShell
      role={session.user.role}
      userName={session.user.name}
      userRole={session.user.role}
      unreadNotificationCount={unreadNotificationCount}
    >
      {children}
    </AppShell>
  );
}
