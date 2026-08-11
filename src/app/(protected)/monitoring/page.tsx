import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  tableLinkClassName,
} from "@/components/ui";
import { StatusBadge } from "@/components/referral/status-badge";

export default async function MonitoringPage() {
  const referrals = await prisma.referral.findMany({
    where: {
      status: {
        notIn: ["DRAFT", "CANCELLED"],
      },
    },
    include: {
      businessGroup: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Monitoring</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Pantau status referral operasional</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow className="pointer-events-none hover:bg-transparent">
                  <TableHead>No. Referral</TableHead>
                  <TableHead>Nasabah</TableHead>
                  <TableHead>Business Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terakhir Diperbarui</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.length === 0 ? (
                  <TableEmpty colSpan={5} message="Belum ada referral aktif." />
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
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        {formatDate(r.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
}
