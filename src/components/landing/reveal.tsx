"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay (ms) sebelum animasi, untuk efek stagger. */
  delay?: number;
  /** Arah masuk animasi. Default: naik ke atas. */
  from?: "up" | "down" | "left" | "right" | "none";
};

const hiddenTransforms: Record<NonNullable<RevealProps["from"]>, string> = {
  up: "translate-y-10",
  down: "-translate-y-10",
  left: "translate-x-10",
  right: "-translate-x-10",
  none: "",
};

/**
 * Membungkus konten dengan animasi fade + slide yang dipicu saat elemen
 * masuk viewport (IntersectionObserver). Elemen mulai transparan & bergeser,
 * lalu tampil penuh ketika terlihat oleh pengguna (saat scrolling).
 */
export function Reveal({ children, className, delay = 0, from = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Selalu mulai hidden (deterministik untuk hydration SSR vs client).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Fallback ketika IntersectionObserver tidak tersedia: tampilkan segera.
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!cancelled) setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        visible
          ? "translate-x-0 translate-y-0 opacity-100"
          : `opacity-0 ${hiddenTransforms[from]}`,
        className,
      )}
    >
      {children}
    </div>
  );
}