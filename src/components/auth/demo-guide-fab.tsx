"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoGuideModal } from "@/components/auth/demo-guide-modal";
import { switchDemoAccountAction } from "@/actions/auth.actions";

const DEMO_FILL_EVENT = "bgr-demo-fill";

export function dispatchDemoAccountFill(email: string) {
  window.dispatchEvent(new CustomEvent(DEMO_FILL_EVENT, { detail: { email } }));
}

export function DemoGuideFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Sembunyikan tombol panduan demo pada landing page publik.
  if (pathname === "/") {
    return null;
  }

  async function handleUseAccount(email: string) {
    setOpen(false);

    if (pathname === "/login") {
      dispatchDemoAccountFill(email);
      return;
    }

    setSwitching(true);
    try {
      await switchDemoAccountAction(email);
    } catch {
      setSwitching(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={switching}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#0066AE] px-4 py-3 text-sm font-semibold text-white shadow-lg transition",
          "hover:bg-[#005a96] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#63ACF2] focus:ring-offset-2",
          "disabled:cursor-wait disabled:opacity-70",
          "dark:focus:ring-offset-[#0a1220]",
        )}
        aria-label="Buka panduan demo"
      >
        <BookOpen className="h-5 w-5 shrink-0" />
        <span className="hidden sm:inline">Panduan Demo</span>
      </button>

      <DemoGuideModal
        open={open}
        onClose={() => setOpen(false)}
        onUseAccount={handleUseAccount}
      />
    </>
  );
}

export { DEMO_FILL_EVENT };
