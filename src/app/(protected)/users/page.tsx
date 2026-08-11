import { prisma } from "@/lib/db";
import {
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      businessUnit: { select: { name: true } },
      businessGroup: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pengguna</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manajemen pengguna aplikasi</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow className="pointer-events-none hover:bg-transparent">
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit / BG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-slate-900 dark:text-white">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="info">{u.role.replaceAll("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.status === "ACTIVE" ? "success" : "default"}>{u.status}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {u.businessUnit?.name ?? "-"} / {u.businessGroup?.name ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
}
