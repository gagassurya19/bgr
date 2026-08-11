const STEPS = [
  "Input Referral",
  "Upload Formulir Persetujuan",
  "Upload Dokumen",
  "Validasi Otomatis",
  "Approval Head Unit",
  "Submit ke Anak Perusahaan",
  "Proses Analisa Anak Perusahaan",
  "Update Status Real-Time",
  "Dashboard Monitoring",
];

export function ReferralProgressStepper() {
  return (
    <div className="bgr-card overflow-hidden p-4 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">Progress Referral</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[720px] items-start justify-between gap-1">
          {STEPS.map((label, index) => {
            const step = index + 1;
            const isLast = index === STEPS.length - 1;

            return (
              <div key={label} className="flex flex-1 items-start">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0066AE] to-[#2FA6FC] text-xs font-bold text-white shadow-sm">
                    {String(step).padStart(2, "0")}
                  </div>
                  <p className="mt-2 max-w-[88px] text-center text-[10px] leading-tight text-slate-600 sm:text-xs">
                    {label}
                  </p>
                </div>
                {!isLast && (
                  <div
                    className="mx-1 mt-4 h-0.5 flex-1 min-w-[12px] bg-gradient-to-r from-[#63ACF2] to-[#AAD2F8]"
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
