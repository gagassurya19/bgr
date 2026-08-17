"use client";

import { useEffect, useRef, useState } from "react";

export function PdfThumbnail({ documentId, filename }: { documentId: string; filename: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"loading" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        // Load pdf.js only at runtime in the browser.
        // Importing it statically at module level crashes SSR because
        // Node.js has no DOMMatrix (pdf.js/src/display/canvas.js).
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const task = pdfjsLib.getDocument({ url: `/api/documents/${documentId}` });
        const pdf = await task.promise;
        if (cancelled) {
          task.destroy();
          return;
        }
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const outputScale = 2;
        const width = Math.floor(viewport.width * outputScale);
        const height = Math.floor(viewport.height * outputScale);
        const MAX_W = 160;
        const scale = Math.min(1, MAX_W / width);
        const canvas = canvasRef.current;
        if (!canvas) {
          if (!cancelled) page.cleanup();
          return;
        }
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const renderScale = outputScale * scale;
        await page.render({
          canvas,
          canvasContext: ctx,
          viewport: page.getViewport({ scale: renderScale }),
        }).promise;
        page.cleanup();
      } catch {
        if (!cancelled) setState("error");
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  if (state === "error") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md bg-slate-100 px-2 text-center text-[10px] font-medium text-slate-500 dark:bg-[#0f1a2e] dark:text-slate-400">
        <span className="line-clamp-2">{filename}</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full object-contain"
      aria-label={`Pratinjau ${filename}`}
    />
  );
}
