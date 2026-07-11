"use client";

import { forwardRef } from "react";
import { money } from "@/data/receipts";

export type ReceiptDocData = {
  number: string;
  date: string;
  business: {
    name: string;
    logoUrl: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    footerNote: string | null;
  };
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  referenceLabel: string | null;
  referenceValue: string | null;
  paidBy: string | null;
  items: { description: string; amount: number }[];
  total: number;
};

/**
 * Hard-coded hex palette. Tailwind v4 emits `oklch()` for color utilities,
 * which html2canvas cannot parse ("unsupported color function") — so every
 * color on this document is an inline hex value instead of a utility class.
 */
const C = {
  ink: "#171717",
  sub: "#6b7280",
  faint: "#9ca3af",
  line: "#e5e7eb",
  lineSoft: "#f1f1f2",
  panel: "#f4f4f5",
  white: "#ffffff",
};

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.12em]";
const labelStyle = { color: C.faint };

/**
 * A fixed A4-width, always-light receipt document styled after a clean,
 * Apple-like invoice. Rendered on screen for preview and snapshotted to a PDF.
 */
export const ReceiptDocument = forwardRef<
  HTMLDivElement,
  { data: ReceiptDocData }
>(({ data }, ref) => {
  const { business, customer } = data;
  return (
    <div
      className="flex flex-col font-sans"
      ref={ref}
      style={{
        width: 794,
        minHeight: 1123,
        padding: "72px 64px",
        background: C.white,
        color: C.ink,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center" style={{ height: 64 }}>
          {business.logoUrl ? (
            // biome-ignore lint/performance/noImgElement: html2canvas needs a raw <img>, not next/image
            // biome-ignore lint/correctness/useImageSize: logo dimensions are constrained via max-width/height
            <img
              alt=""
              crossOrigin="anonymous"
              src={business.logoUrl}
              style={{ maxHeight: 64, maxWidth: 220, objectFit: "contain" }}
            />
          ) : (
            <span className="font-bold text-2xl tracking-tight">
              {business.name}
            </span>
          )}
        </div>
        <div
          className="flex flex-col items-end gap-1 text-[13px]"
          style={{ color: C.sub }}
        >
          {business.phone ? <span>{business.phone}</span> : null}
          {business.email ? <span>{business.email}</span> : null}
          {business.address ? <span>{business.address}</span> : null}
        </div>
      </div>

      <div className="mt-10 h-px w-full" style={{ background: C.line }} />

      {/* Receipt / date */}
      <div className="mt-8 flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <span className={LABEL} style={labelStyle}>
            Receipt
          </span>
          <span className="font-bold text-3xl tracking-tight">
            {data.number}
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={LABEL} style={labelStyle}>
            Date
          </span>
          <span className="font-medium text-lg">{data.date}</span>
        </div>
      </div>

      {/* Customer */}
      <span className={`${LABEL} mt-8`} style={labelStyle}>
        Customer
      </span>
      <div
        className="mt-3 flex gap-10 rounded-2xl px-7 py-6"
        style={{ background: C.panel }}
      >
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className={LABEL} style={labelStyle}>
              Name
            </span>
            <span className="font-medium text-[17px]">{customer.name}</span>
          </div>
          {customer.phone || customer.email ? (
            <div className="flex flex-col gap-1">
              <span className={LABEL} style={labelStyle}>
                Phone / Email
              </span>
              <span className="font-medium text-[17px]">
                {customer.email ?? customer.phone}
              </span>
            </div>
          ) : null}
        </div>
        {data.referenceValue ? (
          <div className="flex flex-1 flex-col gap-1">
            <span className={LABEL} style={labelStyle}>
              {data.referenceLabel || "Reference"}
            </span>
            <span className="font-medium text-[17px]">
              {data.referenceValue}
            </span>
          </div>
        ) : null}
      </div>

      {/* Services */}
      <span className={`${LABEL} mt-10`} style={labelStyle}>
        Services
      </span>
      <div
        className="mt-4 flex items-center justify-between pb-2"
        style={{ borderBottom: `1px solid ${C.line}` }}
      >
        <span className={LABEL} style={labelStyle}>
          Description
        </span>
        <span className={LABEL} style={labelStyle}>
          Amount
        </span>
      </div>
      {data.items.map((item, i) => (
        <div
          className="flex items-center justify-between py-4"
          key={i}
          style={{ borderBottom: `1px solid ${C.lineSoft}` }}
        >
          <span className="font-medium text-[16px]">{item.description}</span>
          <span className="font-medium text-[16px] tabular-nums">
            {money(item.amount)}
          </span>
        </div>
      ))}

      {/* Totals */}
      <div className="mt-3 flex flex-col items-end gap-3">
        <div className="flex w-1/2 items-center justify-between">
          <span className="text-[15px]" style={{ color: C.sub }}>
            Subtotal
          </span>
          <span className="font-medium text-[16px] tabular-nums">
            {money(data.total)}
          </span>
        </div>
        <div className="flex w-1/2 items-center justify-between">
          <span className="font-semibold text-[17px]">Total</span>
          <span className="font-bold text-3xl tabular-nums">
            {money(data.total)}
          </span>
        </div>
      </div>

      {/* Paid by */}
      {data.paidBy ? (
        <div className="mt-10 flex flex-col gap-2">
          <span className={LABEL} style={labelStyle}>
            Paid by
          </span>
          <span className="font-medium text-[17px]">{data.paidBy}</span>
        </div>
      ) : null}

      {/* Footer */}
      <div
        className="mt-auto flex items-center justify-between pt-5"
        style={{ borderTop: `1px solid ${C.line}` }}
      >
        <span className="text-[13px]" style={{ color: C.faint }}>
          {business.footerNote || `Thank you for choosing ${business.name}.`}
        </span>
        <span className="text-[13px]" style={{ color: C.faint }}>
          No taxes applied
        </span>
      </div>
    </div>
  );
});

ReceiptDocument.displayName = "ReceiptDocument";

/**
 * Renders a receipt off-screen, waits for the logo to load, and returns an
 * A4 PDF blob — no visible element required by the caller.
 */
export async function generateReceiptPdf(data: ReceiptDocData): Promise<Blob> {
  const { createRoot } = await import("react-dom/client");
  const { createElement } = await import("react");
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;";
  document.body.appendChild(holder);
  const root = createRoot(holder);
  root.render(createElement(ReceiptDocument, { data }));

  // Let React paint, then wait for any images to settle.
  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r))
  );
  const imgs = Array.from(holder.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          })
    )
  );

  try {
    return await receiptPdfBlob(holder.firstElementChild as HTMLElement);
  } finally {
    root.unmount();
    holder.remove();
  }
}

/**
 * html2canvas reads the computed background of <html>/<body> to paint the page
 * behind the element. This app's theme uses `lab()`/`oklch()` colors there,
 * which html2canvas can't parse — so we pin them to plain values during the
 * snapshot and restore them right after.
 */
function withPlainDocumentColors<T>(fn: () => Promise<T>): Promise<T> {
  const targets = [document.documentElement, document.body];
  const saved = targets.map((el) => ({
    el,
    background: el.style.background,
    color: el.style.color,
  }));
  for (const el of targets) {
    el.style.background = "#ffffff";
    el.style.color = "#171717";
  }
  return fn().finally(() => {
    for (const s of saved) {
      s.el.style.background = s.background;
      s.el.style.color = s.color;
    }
  });
}

/** Snapshots a rendered receipt element into an A4 PDF blob. */
export async function receiptPdfBlob(el: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);
  const canvas = await withPlainDocumentColors(() =>
    html2canvas(el, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    })
  );
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const imgH = (canvas.height * pageW) / canvas.width;
  pdf.addImage(
    canvas.toDataURL("image/png"),
    "PNG",
    0,
    0,
    pageW,
    imgH,
    undefined,
    "FAST"
  );
  return pdf.output("blob");
}
