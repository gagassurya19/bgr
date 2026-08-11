import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

export default async function ApprovalsPage() {
  const referrals = await prisma.referral.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: {
      businessGroup: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Persetujuan</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Referral yang menunggu persetujuan Head Unit
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Antrian Persetujuan ({referrals.length})</CardTitle>
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
                  <TableHead>Disubmit</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.length === 0 ? (
                  <TableEmpty colSpan={6} message="Tidak ada referral menunggu persetujuan." />
                ) : (
                  referrals.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {r.referralNumber}
                      </TableCell>
                      <TableCell>{r.customerName ?? "-"}</TableCell>
                      <TableCell>{r.businessGroup.name}</TableCell>
                      <TableCell>{r.createdBy.name}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        {formatDate(r.submittedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/referrals/${r.id}`} className={tableLinkClassName}>
                          Review →
                        </Link>
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
