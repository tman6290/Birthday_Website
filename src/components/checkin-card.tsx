"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/format";
import type { CheckinGuest } from "@/lib/guests";

const bigBtn =
  "inline-flex min-h-14 w-full items-center justify-center rounded-[4px] px-6 py-4 text-base font-medium uppercase tracking-[0.2em] disabled:opacity-70";

export function CheckinCard({
  guest: initial,
  onNext,
  nextHref,
  onAdmitted,
}: {
  guest: CheckinGuest;
  onNext?: () => void;
  nextHref?: string;
  onAdmitted?: () => void;
}) {
  const [guest, setGuest] = useState(initial);
  const [justAdmitted, setJustAdmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  async function admit() {
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: guest.token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setGuest({ ...guest, status: "arrived", checkedInAt: data.checkedInAt });
        setJustAdmitted(!data.already);
        onAdmitted?.();
      } else if (res.status === 404) {
        setGuest({ ...guest, status: "unknown" });
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const tone =
    guest.status === "unknown"
      ? "bg-wine text-ivory"
      : guest.status === "arrived" && !justAdmitted
        ? "bg-amber text-ink"
        : "bg-emerald text-ivory";

  return (
    <div className="w-full">
      <div
        ref={panelRef}
        tabIndex={-1}
        role="status"
        className={`rounded-[4px] px-6 py-8 text-center outline-none ${tone}`}
      >
        {guest.status === "unknown" ? (
          <p className="font-serif text-4xl">Not on the list</p>
        ) : (
          <>
            <p className="font-serif text-4xl leading-tight">{guest.fullName}</p>
            {guest.arrival && <p className="mt-2 text-lg opacity-90">{guest.arrival}</p>}
            {guest.status === "arrived" && (
              <p className="mt-4 text-lg font-medium">
                {justAdmitted ? "Admitted at" : "Already admitted at"} {formatTime(guest.checkedInAt)}
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {guest.status === "valid" && (
          <button type="button" onClick={admit} disabled={busy} className={`${bigBtn} bg-emerald text-ivory`}>
            Admit
          </button>
        )}
        {failed && (
          <p role="alert" className="text-center text-sm text-wine">
            Something went wrong. Please try again.
          </p>
        )}
        {onNext ? (
          <button type="button" onClick={onNext} className={`${bigBtn} border border-ink text-ink`}>
            Scan next
          </button>
        ) : nextHref ? (
          <Link href={nextHref} className={`${bigBtn} border border-ink text-ink`}>
            Scan next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
