import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Database,
  FileStack,
  Globe,
  HardDrive,
  Server,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

type SettingsLinkItem = {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  meta?: string;
};

function SettingsLinkCard({ item }: { item: SettingsLinkItem }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="group block rounded-xl border border-slate-200/80 bg-white p-4 transition hover:border-[#0066AE]/40 hover:shadow-md dark:border-[#1e3a5f]/60 dark:bg-[#111d33]/50 dark:hover:border-[#63ACF2]/40"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0066AE]/10 text-[#0066AE] transition group-hover:bg-[#0066AE]/15 dark:bg-[#0066AE]/20 dark:text-[#63ACF2]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#0066AE] dark:group-hover:text-[#63ACF2]" />
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {item.description}
          </p>
          {item.meta && (
            <p className="mt-2 text-xs font-medium text-[#0066AE] dark:text-[#63ACF2]">{item.meta}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-[#1e3a5f]/40 dark:bg-[#0f1a2e]/50">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0066AE] dark:text-[#63ACF2]" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}

export function SettingsHub({
  stats,
}: {
  stats: {
    documentRequirements: number;
    users: number;
    businessGroups: number;
  };
}) {
  const referralItems: SettingsLinkItem[] = [
    {
      href: "/settings/document-requirements",
      title: "Persyaratan Dokumen",
      description: "Kelola jenis dokumen wajib (KTP, KK, NPWP, dll.) per business group.",
      icon: FileStack,
      meta: `${stats.documentRequirements} persyaratan aktif`,
    },
  ];

  const organizationItems: SettingsLinkItem[] = [
    {
      href: "/users",
      title: "Pengguna",
      description: "Lihat daftar pengguna, role, dan unit kerja yang terdaftar di sistem.",
      icon: Users,
      meta: `${stats.users} pengguna`,
    },
    {
      href: "/business-groups",
      title: "Business Group",
      description: "Anak perusahaan tujuan referral dan konfigurasi terkait.",
      icon: Building2,
      meta: `${stats.businessGroups} business group`,
    },
  ];

  return (
    <div className="space-y-8">
      <SettingsSection
        title="Konfigurasi Referral"
        description="Aturan dokumen dan validasi alur referral."
      >
        {referralItems.map((item) => (
          <SettingsLinkCard key={item.href} item={item} />
        ))}
      </SettingsSection>

      <SettingsSection
        title="Organisasi & Akses"
        description="Manajemen pengguna dan struktur business group."
      >
        {organizationItems.map((item) => (
          <SettingsLinkCard key={item.href} item={item} />
        ))}
      </SettingsSection>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-[#0066AE] dark:text-[#63ACF2]" />
            Informasi Sistem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow
              icon={Globe}
              label="Lingkungan"
              value="Aplikasi BGR — jaringan LAN kantor internal"
            />
            <InfoRow icon={Database} label="Database" value="PostgreSQL (DATABASE_URL)" />
            <InfoRow icon={HardDrive} label="Backup" value="PostgreSQL + folder storage/documents" />
            <InfoRow
              icon={Shield}
              label="Environment Variables"
              value="DATABASE_URL, AUTH_SECRET, APP_URL, STORAGE_PATH"
            />
          </div>
          <p className={cn("mt-4 text-xs text-slate-400 dark:text-slate-500")}>
            Hubungi tim IT untuk perubahan konfigurasi deployment produksi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
