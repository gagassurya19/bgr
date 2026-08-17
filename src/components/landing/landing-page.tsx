"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  FileText,
  FolderOpen,
  Bell,
  Users,
  Calculator,
  ShieldCheck,
  Sparkles,
  Heart,
  ClipboardCheck,
  Shield,
  Building2,
  Boxes,
  TrendingUp,
  MapPin,
  Landmark,
  BarChart3,
  BadgeCheck,
  Smartphone,
  FileCheck2,
  Car,
  LifeBuoy,
} from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { KkbSimulator } from "@/components/simulasi/kkb-simulator";
import { InsuranceSimulator } from "@/components/simulasi/insurance-simulator";
import { DEFAULT_SIMULATION_CONFIG } from "@/lib/simulasi/config";

export function LandingPage({ isAuthed }: { isAuthed: boolean }) {
  const [simTab, setSimTab] = useState<"kkb" | "insurance">("kkb");

  return (
    <div className="min-h-screen scroll-smooth bg-[#f4f7fb] text-slate-900 dark:bg-[#0a1220] dark:text-white">
      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-[#1e3a5f]/60 dark:bg-[#0a1220]/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0066AE] text-sm font-bold text-white shadow-md shadow-[#0066AE]/30">
              BGR
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">BGR</p>
              <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                Business Group Referral
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#fitur" className="transition hover:text-[#0066AE] dark:hover:text-[#63ACF2]">Fitur</a>
            <a href="#alur" className="transition hover:text-[#0066AE] dark:hover:text-[#63ACF2]">Alur Kerja</a>
            <a href="#simulasi" className="transition hover:text-[#0066AE] dark:hover:text-[#63ACF2]">Simulasi</a>
            <a href="#tentang" className="transition hover:text-[#0066AE] dark:hover:text-[#63ACF2]">Tentang</a>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthed ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0066AE] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#0066AE]/30 transition hover:bg-[#005a96] dark:bg-[#0066AE] dark:hover:bg-[#005a96]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Buka Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0066AE] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#0066AE]/30 transition hover:bg-[#005a96]"
              >
                <ArrowRight className="h-4 w-4" />
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ===== HERO (full screen) ===== */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#0066AE]/20 via-[#2FA6FC]/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 hidden h-64 w-64 rounded-full bg-[#0066AE]/10 blur-3xl lg:block" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-16 text-center sm:px-6">
          <div
            className="animate-bgr-rise mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#0066AE]/20 bg-[#0066AE]/5 px-4 py-1.5 text-xs font-medium text-[#0066AE] dark:border-[#63ACF2]/30 dark:bg-[#0066AE]/10 dark:text-[#63ACF2]"
            style={{ animationDelay: "0ms" }}
          >
            <MapPin className="h-3.5 w-3.5" />
            Platform Referral Internal · KCU BCA Tulungagung
          </div>

          <h1
            className="animate-bgr-rise mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "120ms" }}
          >
            Kelola Referral{" "}
            <span className="bg-gradient-to-r from-[#0066AE] to-[#2FA6FC] bg-clip-text text-transparent">
              Tumbuh Bersama
            </span>{" "}
            dalam Satu Platform
          </h1>

          <p
            className="animate-bgr-rise mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            BGR (Business Group Referral) adalah sistem digital internal yang menghubungkan
            nasabah, kantor cabang, dan anak perusahaan BCA — dari pengajuan, verifikasi
            dokumen, persetujuan, hingga proses di anak perusahaan — dalam satu alur yang
            transparan dan terukur.
          </p>

          <div
            className="animate-bgr-rise mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "360ms" }}
          >
            {isAuthed ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0066AE] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0066AE]/30 transition hover:-translate-y-0.5 hover:bg-[#005a96]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Buka Dashboard Sekarang
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0066AE] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0066AE]/30 transition hover:-translate-y-0.5 hover:bg-[#005a96]"
                >
                  Masuk ke Aplikasi
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#simulasi"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-[#1e3a5f]/60 dark:bg-[#111d33] dark:text-slate-200 dark:hover:bg-[#111d33]/70"
                >
                  Coba Simulasi Gratis
                </Link>
              </>
            )}
          </div>

          {/* Hero Stat Cards */}
          <div
            className="animate-bgr-rise mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
            style={{ animationDelay: "480ms" }}
          >
            {[
              { icon: FileText, label: "Referral Digital", value: "5+ Status" },
              { icon: Building2, label: "Anak Perusahaan", value: "4 Grup" },
              { icon: FolderOpen, label: "Jenis Dokumen", value: "8+ Dokumen" },
              { icon: Calculator, label: "Simulasi", value: "KKB & Asuransi" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-[#1e3a5f]/60 dark:bg-[#111d33]"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0066AE]/10 text-[#0066AE] dark:bg-[#0066AE]/20 dark:text-[#63ACF2]">
                  <s.icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="animate-bgr-pulse-soft mt-10 flex justify-center">
            <div className="flex flex-col items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <span>Scroll untuk menjelajahi</span>
              <span className="animate-bgr-float text-lg leading-none">↓</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="border-y border-slate-200/70 bg-white py-6 dark:border-[#1e3a5f]/60 dark:bg-[#111d33]/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-[#0066AE]" /> BCA Finance
          </span>
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-[#0066AE]" /> BCA Life
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0066AE]" /> BCA Insurance
          </span>
          <span className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-[#0066AE]" /> BCA Digital
          </span>
        </div>
      </section>

      {/* ===== FEATURES (full screen) ===== */}
      <section id="fitur" className="flex min-h-screen items-center py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0066AE] dark:text-[#63ACF2]">
              Fitur Lengkap
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Semua Kebutuhan Operasional Referral
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Dari pembuatan referral hingga simulasi kredit — semua dalam satu genggaman.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: LayoutDashboard,
                title: "Dashboard & Analitik",
                desc: "Poin performa bisnis grup, tren referral, status approval, konversi, dan KPI dalam satu layar.",
              },
              {
                icon: FileText,
                title: "Manajemen Referral",
                desc: "Buat, edit, dan lacak referral dari Draft hingga Selesai dengan alur status yang jelas.",
              },
              {
                icon: FolderOpen,
                title: "Dokumen & Bukti",
                desc: "Unggah KTP, KK, NPWP, Mutasi Rekening, SPK, IBS, dan SPT Pajak. Pratinjau gambar & PDF langsung di aplikasi.",
              },
              {
                icon: ClipboardCheck,
                title: "Persetujuan & Revisi",
                desc: "Approval Head Unit, alur revisi hingga kembali ke pembuat, dan riwayat keputusan yang terekam.",
              },
              {
                icon: Boxes,
                title: "Anak Perusahaan",
                desc: "Submit ke anak perusahaan, proses, setujui, tolak, atau minta revisi dengan deskripsi yang jelas.",
              },
              {
                icon: Calculator,
                title: "Simulasi KKB",
                desc: "Hitung cicilan kredit kendaraan flat dengan bandingkan tenor 1–5 tahun dan TDP lengkap.",
              },
              {
                icon: Shield,
                title: "Simulasi BCA Insurance",
                desc: "Estimasi premi Auto Cillin (All Risk/TLO), Kesehatan, dan Jiwa berdasarkan parameter Anda.",
              },
              {
                icon: Users,
                title: "Manajemen Pengguna",
                desc: "Tambah, edit, dan nonaktifkan akun operasional (RO, Head Unit, Processor, Viewer).",
              },
              {
                icon: Bell,
                title: "Notifikasi Real-time",
                desc: "Informasi status terbaru referral, tugas baru, dan revisi langsung ke siapa yang bertanggung jawab.",
              },
              {
                icon: BarChart3,
                title: "Monitoring & Audit",
                desc: "Timeline lengkap setiap perubahan status dan audit trail untuk kepatuhan internal.",
              },
              {
                icon: FileCheck2,
                title: "Validasi Otomatis",
                desc: "Cek kelengkapan data & dokumen sebelum approval untuk mengurangi penolakan.",
              },
              {
                icon: BadgeCheck,
                title: "Role-based Access",
                desc: "Hak akses RO, Head Unit, Processor, dan Viewer — aman dan terkontrol.",
              },
            ].map((f, index) => (
              <Reveal key={f.title} delay={(index % 3) * 120}>
                <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#0066AE]/40 hover:shadow-lg hover:shadow-[#0066AE]/10 dark:border-[#1e3a5f]/60 dark:bg-[#111d33] dark:hover:border-[#63ACF2]/40">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066AE] to-[#2FA6FC] text-white shadow-md shadow-[#0066AE]/30 transition group-hover:scale-110">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS (full screen) ===== */}
      <section id="alur" className="flex min-h-screen items-center border-y border-slate-200/70 bg-white py-16 dark:border-[#1e3a5f]/60 dark:bg-[#111d33]/50 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0066AE] dark:text-[#63ACF2]">
              Alur Kerja
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Dari Pengajuan Hingga Selesai
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Setiap tahapan tervalidasi, tercatat, dan mudah dipantau.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {[
              {
                icon: FileText,
                step: "01",
                title: "Dibuat & Disubmit",
                desc: "Referral Officer membuat referral lengkap dengan data nasabah & dokumen wajib.",
              },
              {
                icon: Shield,
                step: "02",
                title: "Validasi & Approval",
                desc: "Validasi otomatis cek kelengkapan, lalu Head Unit menyetujui, menolak, atau meminta revisi.",
              },
              {
                icon: Building2,
                step: "03",
                title: "Proses Anak Perusahaan",
                desc: "Disubmit ke anak perusahaan, diproses, disetujui/selesai, atau dikembalikan dengan catatan revisi.",
              },
              {
                icon: TrendingUp,
                step: "04",
                title: "Selesai & Terukur",
                desc: "Status Selesai tercatat, seluruh timeline & approval terdokumentasi untuk monitoring.",
              },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 150}>
                <div className="relative">
                  {i < 3 && (
                    <div className="absolute left-full top-8 hidden h-0.5 w-full -translate-x-5 bg-gradient-to-r from-[#0066AE]/40 to-transparent lg:block" />
                  )}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-[#1e3a5f]/60 dark:bg-[#111d33]">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0066AE]/10 text-[#0066AE] dark:bg-[#0066AE]/20 dark:text-[#63ACF2]">
                        <s.icon className="h-5 w-5" />
                      </div>
                      <span className="text-3xl font-extrabold text-slate-100 dark:text-[#1e3a5f]/80">
                        {s.step}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SIMULASI INTERAKTIF (full screen) ===== */}
      <section id="simulasi" className="flex min-h-screen items-center py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5 text-xs font-semibold text-green-700 dark:border-green-500/40 dark:bg-green-900/20 dark:text-green-400">
              <Sparkles className="h-3.5 w-3.5" />
              Gratis · Tanpa Login
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0066AE] dark:text-[#63ACF2]">
              Simulasi Finansial
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Hitung Sekarang, Tanpa Perlu Login
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Gunakan kalkulator KKB dan premi asuransi langsung di halaman ini —
              hasil diperbarui secara instan saat Anda mengubah input.
            </p>
          </Reveal>

          {/* Tab Pilih Kalkulator */}
          <Reveal delay={120} className="mt-8">
            <div className="mx-auto flex max-w-md items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-[#1e3a5f]/60 dark:bg-[#111d33]">
              <button
                type="button"
                onClick={() => setSimTab("kkb")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  simTab === "kkb"
                    ? "bg-[#0066AE] text-white shadow dark:bg-[#0066AE]"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#1e3a5f]/40"
                }`}
              >
                <Car className="h-4 w-4" />
                Simulasi KKB
              </button>
              <button
                type="button"
                onClick={() => setSimTab("insurance")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  simTab === "insurance"
                    ? "bg-[#0066AE] text-white shadow dark:bg-[#0066AE]"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#1e3a5f]/40"
                }`}
              >
                <LifeBuoy className="h-4 w-4" />
                Simulasi Asuransi
              </button>
            </div>
          </Reveal>

          {/* Kalkulator (berjalan penuh di sisi klien) */}
          <Reveal delay={200} className="mt-6">
            {simTab === "kkb" ? (
              <KkbSimulator config={DEFAULT_SIMULATION_CONFIG.kkb} />
            ) : (
              <InsuranceSimulator config={DEFAULT_SIMULATION_CONFIG.insurance} />
            )}

            <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
              Hasil simulasi bersifat estimasi. Pengguna internal dapat menyimpan konfigurasi
              tarif default melalui menu <strong>Pengaturan → Tarif Simulasi</strong> setelah login.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===== SOW / HONOR SECTION (full screen) ===== */}
      <section id="tentang" className="relative flex min-h-screen items-center overflow-hidden bg-[#0066AE] py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#2FA6FC]/20 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-between">
            <div className="max-w-xl text-center lg:text-left">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  Dipersembahkan untuk Operasional Referral
                </div>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  BGR — BCA Business Group Referral
                </h2>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-4 text-sm leading-relaxed text-white/85">
                  Platform ini dirancang dan dioperasikan untuk{" "}
                  <strong className="font-bold text-white">KCU BCA Tulungagung</strong> —
                  mendukung percepatan layanan referral nasabah di wilayah kerja dan anak
                  perusahaan BCA.
                </p>
              </Reveal>

              <Reveal delay={300}>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur">
                    <Landmark className="h-4 w-4" />
                    KCU BCA Tulungagung
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur">
                    <BarChart3 className="h-4 w-4" />
                    Konsiden Monitoring
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={250} from="right" className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-[#0066AE]">
                    SOW
                  </div>
                  <div>
                    <p className="text-lg font-extrabold leading-tight">SOW Tulungagung</p>
                    <p className="text-xs text-white/75">Software House</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/90">
                  Dikembangkan dan dirawat oleh{" "}
                  <strong className="font-bold text-white">SOW KCU BCA Tulungagung</strong> —
                  tim teknologi internal yang berdedikasi mendukung digitalisasi operasional
                  BCA di wilayah Tulungagung dan sekitarnya.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
                  <Building2 className="h-3.5 w-3.5" />
                  Kontribusi nyata untuk transformasi digital BCA
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== CTA (full screen) ===== */}
      <section className="flex min-h-screen items-center py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-8 text-center shadow-xl dark:border-[#1e3a5f]/60 dark:bg-[#111d33] sm:p-14">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0066AE]/5 to-transparent" />
              <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-3xl">
                Siap Memulai Referral?
              </h2>
              <p className="relative mx-auto mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                Masuk untuk mengelola referral, menyetujui pengajuan, memproses dari anak
                perusahaan, atau mencoba simulasi finansial.
              </p>
              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
                {isAuthed ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0066AE] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0066AE]/30 transition hover:-translate-y-0.5 hover:bg-[#005a96]"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Buka Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0066AE] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0066AE]/30 transition hover:-translate-y-0.5 hover:bg-[#005a96]"
                  >
                    Masuk ke Aplikasi
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200/70 bg-white py-10 dark:border-[#1e3a5f]/60 dark:bg-[#111d33]/50">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0066AE] text-xs font-bold text-white">
                BGR
              </div>
              <div>
                <p className="text-sm font-bold">BGR — Business Group Referral</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sistem Referral Internal KCU BCA Tulungagung
                </p>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 sm:text-right">
              <p>
                © 2026 <strong>KCU BCA Tulungagung</strong> · Seluruh hak cipta
              </p>
              <p className="mt-1">
                Dikembangkan dan dirawat oleh{" "}
                <strong className="font-semibold text-slate-700 dark:text-slate-300">
                  SOW Tulungagung
                </strong>{" "}
                untuk BCA
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}