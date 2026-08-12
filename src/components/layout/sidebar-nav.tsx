"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Monitor,
  FolderOpen,
  Bell,
  Settings,
  UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { UnreadBadge } from "@/components/notifications/unread-badge";

const navItems: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}> = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/referrals", label: "Referral", icon: FileText, roles: ["SUBSIDIARY_PROCESSOR","REFERRAL_OFFICER", "ADMIN", "SUPER_ADMIN", "HEAD_UNIT", "VIEWER"] },
  { href: "/documents", label: "Dokumen", icon: FolderOpen },
  { href: "/approvals", label: "Approval", icon: CheckSquare, roles: ["HEAD_UNIT", "ADMIN", "SUPER_ADMIN"] },
  { href: "/monitoring", label: "Monitoring", icon: Monitor },
  { href: "/notifications", label: "Notifikasi", icon: Bell },
  { href: "/users", label: "Pengguna", icon: UsersIcon, roles: ["ADMIN", "SUPER_ADMIN"] },
  { href: "/settings", label: "Pengaturan", icon: Settings, roles: ["ADMIN", "SUPER_ADMIN"] },
];

export function SidebarNav({
  role,
  unreadNotificationCount,
  onNavigate,
}: {
  role: UserRole;
  unreadNotificationCount: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition",
              active
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/85 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/notifications" && (
              <UnreadBadge count={unreadNotificationCount} className="ml-auto" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
