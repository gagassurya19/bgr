import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { canViewReferralDocuments } from "@/lib/rbac";
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
} from "@/components/ui";

export default async function DocumentsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const documents = await prisma.referralDocument.findMany({
    include: {
      referral: { select: { id: true, referralNumber: true, createdById: true } },
      uploadedBy: { select: { name: true } },
      requirement: { select: { code: true, name: true } },
    },
    orderBy: { uploadedAt: "desc" },
    take: 50,
  });

  const withAccess = documents.map((d) => ({
    ...d,
    canView: session?.user
      ? canViewReferralDocuments(session.user.role, userId, d.referral.createdById)
      : false,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dokumen</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Daftar dokumen referral</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow className="pointer-events-none hover:bg-transparent">
                  <TableHead>File</TableHead>
                  <TableHead>Referral</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Diunggah oleh</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withAccess.length === 0 ? (
                  <TableEmpty colSpan={5} message="Belum ada dokumen." />
                ) : (
                  withAccess.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="max-w-[200px] truncate font-medium text-slate-900 dark:text-white">
                        {d.canView ? (
                          <a
                            href={`/api/documents/${d.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#0066AE] transition hover:underline dark:text-[#63ACF2]"
                          >
                            {d.originalFilename}
                          </a>
                        ) : (
                          d.originalFilename
                        )}
                      </TableCell>
                      <TableCell>{d.referral.referralNumber}</TableCell>
                      <TableCell>{d.requirement?.name ?? "Umum"}</TableCell>
                      <TableCell>{d.uploadedBy.name}</TableCell>
                      <TableCell className="text-slate-500 dark:text-slate-400">
                        {formatDate(d.uploadedAt)}
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
