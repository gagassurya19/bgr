import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const all = await p.documentRequirement.findMany({ orderBy: [{ businessGroupId: 'asc' }, { sortOrder: 'asc' }] });
console.log("TOTAL DocumentRequirement:", all.length);
console.log(all.map(r => ({ code: r.code, bgId: r.businessGroupId ? 'GROUP' : 'GLOBAL', required: r.isRequired })));
await p.$disconnect();
