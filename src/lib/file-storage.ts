import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "referral-documents";

let supabaseAdmin: SupabaseClient | null = null;

function useSupabaseStorage(): boolean {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key && key !== "your-service-role-key");
}

function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Supabase URL belum dikonfigurasi.");
  return url;
}

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = getSupabaseUrl();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key || key === "your-service-role-key") {
      throw new Error("Supabase storage belum dikonfigurasi.");
    }
    supabaseAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAdmin;
}

function getLocalStorageRoot(): string {
  return process.env.STORAGE_PATH ?? "./storage/documents";
}

function isSupabaseKey(storageKey: string): boolean {
  return storageKey.startsWith("supabase:");
}

function toSupabaseObjectKey(storageKey: string): string {
  return storageKey.replace(/^supabase:/, "");
}

export async function writeDocumentFile(
  referralId: string,
  storedFilename: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  if (useSupabaseStorage()) {
    const objectKey = `${referralId}/${storedFilename}`;
    const { error } = await getSupabaseAdmin()
      .storage.from(SUPABASE_BUCKET)
      .upload(objectKey, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Gagal upload ke Supabase Storage: ${error.message}`);
    }

    return `supabase:${objectKey}`;
  }

  const storageRoot = getLocalStorageRoot();
  const referralDir = path.join(storageRoot, referralId);
  const storagePath = path.join(referralDir, storedFilename);
  await mkdir(referralDir, { recursive: true });
  await writeFile(storagePath, buffer);
  return storagePath;
}

export async function readDocumentFile(storageKey: string): Promise<Buffer> {
  if (isSupabaseKey(storageKey)) {
    const objectKey = toSupabaseObjectKey(storageKey);
    const { data, error } = await getSupabaseAdmin()
      .storage.from(SUPABASE_BUCKET)
      .download(objectKey);

    if (error || !data) {
      throw new Error(`Gagal membaca file dari Supabase Storage: ${error?.message ?? "unknown"}`);
    }

    return Buffer.from(await data.arrayBuffer());
  }

  return readFile(storageKey);
}

export async function deleteDocumentFile(storageKey: string): Promise<void> {
  if (isSupabaseKey(storageKey)) {
    const objectKey = toSupabaseObjectKey(storageKey);
    await getSupabaseAdmin().storage.from(SUPABASE_BUCKET).remove([objectKey]);
    return;
  }

  try {
    await unlink(storageKey);
  } catch {
    // ignore missing local files
  }
}

export function getStorageBackendLabel(): "supabase" | "local" {
  return useSupabaseStorage() ? "supabase" : "local";
}
