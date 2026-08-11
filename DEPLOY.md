# Deploy BGR ke Vercel + Supabase

Panduan deploy aplikasi **BGR** dengan:
- **Vercel** — hosting Next.js
- **Supabase** — PostgreSQL + Storage (upload dokumen)

---

## Ringkasan arsitektur

| Komponen | Layanan |
|----------|---------|
| Frontend + API | Vercel |
| Database | Supabase PostgreSQL |
| Upload dokumen | Supabase Storage (bucket `referral-documents`) |
| Auth | NextAuth (Credentials) |

> **Penting:** Vercel tidak punya filesystem persisten. Upload dokumen **wajib** memakai Supabase Storage di production.

---

## 1. Setup Supabase

### 1.1 Buat project

1. Buka [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → pilih region terdekat (mis. `Southeast Asia (Singapore)`)
3. Catat **database password**

### 1.2 Ambil connection string

Di **Project Settings → Database → Connection string**:

| Variabel | Connection | Port | Dipakai untuk |
|----------|------------|------|---------------|
| `DATABASE_URL` | **Transaction pooler** | 6543 | App di Vercel (runtime) |
| `DIRECT_URL` | **Direct** atau Session pooler | 5432 | Migrate & seed (lokal) |

Contoh format:

```env
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### 1.3 Buat Storage bucket

1. **Storage → New bucket**
2. Name: `referral-documents`
3. **Private** (recommended)
4. Create bucket

### 1.4 Ambil API keys

**Project Settings → API**:
- `SUPABASE_URL` → Project URL
- `SUPABASE_SERVICE_ROLE_KEY` → `service_role` (secret, jangan expose ke client)

---

## 2. Migrate & seed database (lokal)

Buat `.env.local` dari template:

```bash
cp .env.example .env.local
```

Isi `DIRECT_URL` dan `DATABASE_URL` dari Supabase, plus:

```bash
# Generate secret auth
openssl rand -base64 32
```

Jalankan migrate + seed **ke Supabase**:

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
```

Verifikasi di Supabase **Table Editor** — tabel `User`, `BusinessGroup`, dll. harus terisi.

---

## 3. Deploy ke Vercel

### Opsi A — Via GitHub (disarankan)

1. Push repo ke GitHub:
   ```bash
   git init   # jika belum
   git add .
   git commit -m "Prepare Vercel + Supabase deployment"
   git remote add origin https://github.com/USER/bapak-referral.git
   git push -u origin main
   ```

2. Buka [https://vercel.com/new](https://vercel.com/new)
3. Import repository GitHub
4. Framework: **Next.js** (auto-detect)
5. Tambahkan **Environment Variables** (Production + Preview):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Pooler URL (port 6543) |
| `DIRECT_URL` | Direct URL (port 5432) |
| `AUTH_SECRET` | Random string (openssl) |
| `AUTH_URL` | `https://your-app.vercel.app` |
| `APP_URL` | `https://your-app.vercel.app` |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `SUPABASE_STORAGE_BUCKET` | `referral-documents` |

6. **Deploy**

Build otomatis menjalankan:
```bash
prisma generate && prisma migrate deploy && next build
```

### Opsi B — Via CLI

```bash
npx vercel login
npx vercel link
npx vercel env add DATABASE_URL
# ... tambahkan semua env vars
npx vercel --prod
```

---

## 4. Setelah deploy

1. Buka URL Vercel → halaman login
2. Login demo (jika sudah seed):
   - `admin@example.local` / `Password123!`
3. Update `AUTH_URL` dan `APP_URL` jika domain berubah → redeploy

### Ganti password demo (production)

**Wajib** sebelum go-live — ganti password akun demo atau hapus user demo via Supabase SQL Editor.

---

## 5. Troubleshooting

### Build gagal: Prisma migrate

- Pastikan `DIRECT_URL` benar (port 5432)
- Cek Supabase project tidak paused (free tier)

### Login gagal / 500 error

- `AUTH_SECRET` harus sama di semua env
- `AUTH_URL` harus match URL production (dengan `https://`)

### Upload dokumen gagal

- Bucket `referral-documents` sudah dibuat
- `SUPABASE_SERVICE_ROLE_KEY` benar
- Bucket name match `SUPABASE_STORAGE_BUCKET`

### Database connection timeout

- Runtime **wajib** pakai pooler URL (`6543?pgbouncer=true`)
- Jangan pakai direct URL untuk `DATABASE_URL` di Vercel

---

## 6. Environment variables lengkap

Lihat [`.env.example`](./.env.example).

---

## 7. Backup

- **Database:** Supabase Dashboard → Database → Backups (plan Pro) atau `pg_dump` manual
- **Dokumen:** Supabase Storage → bucket `referral-documents`

---

## Checklist deploy

- [ ] Supabase project dibuat
- [ ] Bucket `referral-documents` dibuat (private)
- [ ] `db:deploy` + `db:seed` sukses ke Supabase
- [ ] Semua env vars di Vercel
- [ ] `AUTH_URL` / `APP_URL` = URL Vercel production
- [ ] Login & upload dokumen ditest
- [ ] Password demo diganti untuk production
