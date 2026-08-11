import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmpty,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
  tableLinkClassName,
} from "@/components/ui";
import { StatusBadge } from "@/components/referral/status-badge";
import { canCreateReferral } from "@/lib/rbac";

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 20;
  const q = params.q?.trim();
  const status = params.status;

  const where = {
    ...(q
      ? {
          OR: [
            { referralNumber: { contains: q, mode: "insensitive" as const } },
            { customerName: { contains: q, mode: "insensitive" as const } },
            { customerIdentifier: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { status: status as never } : {}),
    ...(session?.user.role === "REFERRAL_OFFICER"
      ? { createdById: session.user.id }
      : {}),
  };

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      include: {
        businessGroup: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.referral.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Referral</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Daftar referral operasional</p>
        </div>
        {session?.user && canCreateReferral(session.user.role) && (
          <Link href="/referrals/new">
            <Button>Buat Referral</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <form className="flex flex-wrap gap-3">
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nomor/nama nasabah..."
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-[#1e3a5f] dark:bg-[#0f1a2e] dark:text-slate-200"
            />
            <select
              name="status"
              defaultValue={status ?? ""}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-[#1e3a5f] dark:bg-[#0f1a2e] dark:text-slate-200"
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Menunggu Persetujuan</option>
              <option value="APPROVED">Disetujui</option>
              <option value="IN_PROCESS">Diproses</option>
              <option value="COMPLETED">Selesai</option>
            </select>
            <Button type="submit" variant="secondary">
              Filter
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow className="pointer-events-none hover:bg-transparent">
                  <TableHead>No. Referral</TableHead>
                  <TableHead>Nasabah</TableHead>
                  <TableHead>Business Group</TableHead>
                  <TableHead>Pembuat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.length === 0 ? (
                  <TableEmpty colSpan={6} message="Belum ada referral." />
                ) : (
                  referrals.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link href={`/referrals/${r.id}`} className={tableLinkClassName}>
                          {r.referralNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {r.customerName ?? "-"}
                      </TableCell>
                      <TableCell>{r.businessGroup.name}</TableCell>
                      <TableCell>{r.createdBy.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        {formatDate(r.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            page={page}
            totalPages={totalPages}
            buildHref={(p) =>
              `/referrals?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}${status ? `&status=${status}` : ""}`
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
