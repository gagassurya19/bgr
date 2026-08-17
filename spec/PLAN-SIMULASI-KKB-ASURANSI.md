# Plan: Fitur Simulasi KKB & BCA Insurance

## 1. Ringkasan
Fitur ini menambahkan dua halaman kalkulator interaktif client-side di aplikasi BGR:
1. **/simulasi-kkb**: Simulasi cicilan kredit kendaraan bermotor (bunga flat) dengan perbandingan tenor 1–5 tahun.
2. **/simulasi-asuransi**: Simulasi premi BCA Insurance (Mobil / Auto Cillin, Kesehatan / BCA Life, dan Jiwa / BCA Life).

Tarif default disimpan di database (`SystemSetting`), dapat diubah oleh Admin di menu Pengaturan, dan menjadi nilai bawaan form simulasi yang tetap dapat disesuaikan user secara langsung.

## 2. Rumus Perhitungan

### A. KKB (Kredit Kendaraan Bermotor - Bunga Flat)
- **Pokok Kredit** = `Harga OTR - DP`
- **Total Bunga** = `Pokok Kredit × (Bunga / 100) × Tenor (tahun)`
- **Total yang Dicicil** = `Pokok Kredit + Total Bunga`
- **Cicilan per Bulan** = `Total yang Dicicil / (Tenor × 12)`

### B. Asuransi Mobil (Auto Cillin)
- **Premi Dasar** = `Harga Pertanggungan × (Rate % / 100)`
- **Total Premi/Tahun** = `Premi Dasar + Biaya Admin + Biaya Polis`
- Pilihan Pertanggungan:
  - `All Risk / Komprehensif`: Default rate ~2.2% (rentang 1.8% - 3.5%)
  - `TLO (Total Loss Only)`: Default rate ~0.8% (rentang 0.6% - 1.2%)

### C. Asuransi Kesehatan (BCA Life)
- Estimasi premi tahunan berdasarkan kelompok usia dan plafon tahunan (100jt, 500jt, 1M).

### D. Asuransi Jiwa (BCA Life)
- **Premi per Tahun** = `(Uang Pertanggungan × Rate Usia Gender / 1000)`
- **Total Premi** = `Premi per Tahun × Masa Bayar (tahun)`

## 3. Arsitektur & File Baru
- `src/lib/utils.ts` (tambah `formatCurrency`)
- `src/lib/simulasi/config.ts` (tipe & default config)
- `src/services/simulation-config.service.ts`
- `src/actions/simulation-config.actions.ts`
- `src/services/kkb-simulation.ts` & `src/services/kkb-simulation.test.ts`
- `src/services/insurance-simulation.ts` & `src/services/insurance-simulation.test.ts`
- `src/app/(protected)/simulasi-kkb/page.tsx`
- `src/components/simulasi/kkb-simulator.tsx`
- `src/app/(protected)/simulasi-asuransi/page.tsx`
- `src/components/simulasi/insurance-simulator.tsx`
- `src/app/(protected)/settings/simulasi/page.tsx`
- `src/components/settings/simulation-config-manager.tsx`
