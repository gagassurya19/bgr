import { auth } from "@/lib/auth";
import { getUserNotifications } from "@/lib/notifications";
import { Card, CardContent } from "@/components/ui";
import { NotificationList } from "@/components/notifications/notification-list";

export default async function NotificationsPage() {
  const session = await auth();
  const notifications = await getUserNotifications(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notifikasi</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pemberitahuan in-app — lacak status sudah dibaca atau belum
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <NotificationList notifications={notifications} />
        </CardContent>
      </Card>
    </div>
  );
}
