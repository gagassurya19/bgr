import { createHash, randomUUID } from "crypto";
import path from "path";
import { prisma } from "@/lib/db";
import { writeDocumentFile, readDocumentFile, deleteDocumentFile } from "@/lib/file-storage";
import { auditService } from "@/services/audit.service";
import { AppError } from "@/lib/errors";
import { MAX_UPLOAD_BYTES } from "@/lib/upload.constants";

const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

function getExtension(filename: string): string {
  const ext = path.extname(filename).slice(1).toLowerCase();
  return ext;
}

export const documentService = {
  validateFile(file: File): void {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new AppError("FILE_TOO_LARGE", "Ukuran file melebihi batas 10MB.");
    }

    const ext = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new AppError("INVALID_FILE_TYPE", "Tipe file tidak diizinkan. Gunakan PDF, JPG, atau PNG.");
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new AppError("INVALID_MIME_TYPE", "MIME type file tidak valid.");
    }
  },

  async upload(
    referralId: string,
    file: File,
    requirementId: string | null,
    uploadedById: string,
  ) {
    this.validateFile(file);

    const referral = await prisma.referral.findUnique({ where: { id: referralId } });
    if (!referral) {
      throw new AppError("NOT_FOUND", "Referral tidak ditemukan.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const checksum = createHash("sha256").update(buffer).digest("hex");
    const documentId = randomUUID();
    const safeOriginal = sanitizeFilename(file.name);
    const storedFilename = `${documentId}-${safeOriginal}`;

    let storagePath: string | undefined;

    try {
      const savedStoragePath = await writeDocumentFile(
        referralId,
        storedFilename,
        buffer,
        file.type,
      );
      storagePath = savedStoragePath;

      const doc = await prisma.$transaction(async (tx) => {
        const created = await tx.referralDocument.create({
          data: {
            referralId,
            requirementId,
            originalFilename: file.name,
            storedFilename,
            storagePath: savedStoragePath,
            mimeType: file.type,
            fileSize: BigInt(file.size),
            checksum,
            uploadedById,
            status: "UPLOADED",
          },
        });

        await auditService.log(
          {
            actorId: uploadedById,
            action: "UPLOAD",
            entityType: "DOCUMENT",
            entityId: created.id,
            referralId,
            newData: { filename: file.name, requirementId },
          },
          tx,
        );

        return created;
      });

      return doc;
    } catch (error) {
      if (storagePath) {
        try {
          await deleteDocumentFile(storagePath);
        } catch {
          // ignore cleanup failure
        }
      }
      throw error;
    }
  },

  async getAuthorizedFile(documentId: string) {
    const doc = await prisma.referralDocument.findUnique({
      where: { id: documentId },
      include: { referral: true },
    });
    if (!doc) {
      throw new AppError("NOT_FOUND", "Dokumen tidak ditemukan.");
    }
    const content = await readDocumentFile(doc.storagePath);
    return { doc, content };
  },
};
