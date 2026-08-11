export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_UPLOAD_LABEL = "10MB";

export function formatUploadError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Body exceeded") || message.includes("body size limit")) {
    return `Ukuran file melebihi batas unggah (${MAX_UPLOAD_LABEL}). Pilih file yang lebih kecil.`;
  }

  if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
    return "Gagal mengunggah dokumen. Periksa koneksi jaringan dan coba lagi.";
  }

  return message || "Gagal mengunggah dokumen. Silakan coba lagi.";
}

export function validateUploadFileSize(size: number): string | null {
  if (size <= 0) return "File wajib dipilih.";
  if (size > MAX_UPLOAD_BYTES) {
    return `Ukuran file melebihi batas ${MAX_UPLOAD_LABEL}.`;
  }
  return null;
}
