"use client";

import { useRsvp, type SheetKind } from "./rsvp-context";

export const btnPrimary =
  "inline-flex min-h-12 w-full items-center justify-center rounded-[4px] bg-wine px-6 py-3 text-[0.8rem] font-medium uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-[#6a2327] disabled:opacity-70";
export const btnSecondary =
  "inline-flex min-h-12 w-full items-center justify-center rounded-[4px] border border-wine px-6 py-3 text-[0.8rem] font-medium uppercase tracking-[0.2em] text-wine transition-colors hover:bg-wine/5";

export function RespondButtons({ onChoose }: { onChoose?: (kind: SheetKind) => void }) {
  const { openSheet } = useRsvp();
  const choose = (kind: SheetKind) => {
    onChoose?.(kind);
    openSheet(kind);
  };
  return (
    <div className="flex flex-col gap-3">
      <button type="button" className={btnPrimary} onClick={() => choose("accept")}>
        Accept with pleasure
      </button>
      <button type="button" className={btnSecondary} onClick={() => choose("decline")}>
        Decline with regret
      </button>
    </div>
  );
}
