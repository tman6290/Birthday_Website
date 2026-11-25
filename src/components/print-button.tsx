"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 items-center justify-center rounded-[4px] bg-wine px-8 py-3 text-[0.8rem] font-medium uppercase tracking-[0.2em] text-ivory hover:bg-[#6a2327] print:hidden"
    >
      Print
    </button>
  );
}
