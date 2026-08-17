import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { documentService } from "@/services/document.service";
import { auditService } from "@/services/audit.service";
import { canViewReferralDocuments } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await prisma.referralDocument.findUnique({
    where: { id },
    include: { referral: { select: { createdById: true } } },
  });

  if (!doc) {
    return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });
  }

  const canView = canViewReferralDocuments(
    session.user.role,
    session.user.id,
    doc.referral.createdById,
  );

  if (!canView) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { content } = await documentService.getAuthorizedFile(id);

    await auditService.log({
      actorId: session.user.id,
      action: "DOWNLOAD",
      entityType: "DOCUMENT",
      entityId: id,
      referralId: doc.referralId,
      newData: { filename: doc.originalFilename },
      ipAddress: req.headers.get("x-forwarded-for") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    });

    const sanitized = doc.originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(Uint8Array.from(content), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(content.length),
        "Content-Disposition": `inline; filename="${sanitized}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membaca dokumen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}