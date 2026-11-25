"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type QrScannerType from "qr-scanner";
import { doorCounts, lookupPass } from "@/app/staff-actions";
import type { CheckinGuest } from "@/lib/guests";
import { CheckinCard } from "./checkin-card";

const PASS_PATH = /^\/p\/([A-Za-z0-9_-]{10,64})\/?$/;

function tokenFrom(data: string) {
  try {
    return new URL(data, window.location.origin).pathname.match(PASS_PATH)?.[1] ?? null;
  } catch {
    return null;
  }
}

export function DoorScanner({ initialCounts }: { initialCounts: { admitted: number; attending: number } }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScannerType | null>(null);
  const handling = useRef(false);
  const [figures, setFigures] = useState(initialCounts);
  const [guest, setGuest] = useState<CheckinGuest | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [lookupError, setLookupError] = useState(false);

  const refreshCounts = useCallback(() => {
    doorCounts().then(setFigures).catch(() => {});
  }, []);

  const onDecode = useCallback(async (data: string) => {
    if (handling.current) return;
    const token = tokenFrom(data);
    if (!token) return;
    handling.current = true;
    scannerRef.current?.pause();
    setLookupError(false);
    try {
      setGuest(await lookupPass(token));
    } catch {
      setLookupError(true);
      handling.current = false;
      scannerRef.current?.start();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: QrScanner } = await import("qr-scanner");
      if (cancelled || !videoRef.current) return;
      const scanner = new QrScanner(videoRef.current, (result) => onDecode(result.data), {
        preferredCamera: "environment",
        returnDetailedScanResult: true,
        maxScansPerSecond: 8,
      });
      scannerRef.current = scanner;
      try {
        await scanner.start();
      } catch {
        if (!cancelled) setCameraError(true);
      }
    })();
    return () => {
      cancelled = true;
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, [onDecode]);

  const scanNext = () => {
    setGuest(null);
    handling.current = false;
    refreshCounts();
    scannerRef.current?.start().catch(() => setCameraError(true));
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-5">
      <p className="text-center text-lg text-ink" aria-live="polite">
        <span className="font-medium tabular-nums">{figures.admitted}</span> of{" "}
        <span className="font-medium tabular-nums">{figures.attending}</span> admitted
      </p>

      <div className={`mt-4 ${guest ? "hidden" : ""}`}>
        <div className="relative aspect-square w-full overflow-hidden rounded-[4px] border border-gold bg-ink">
          <video ref={videoRef} className="size-full object-cover" muted playsInline aria-label="Camera" />
        </div>
        {cameraError && (
          <p role="alert" className="mt-4 text-center text-wine">
            The camera isn&apos;t available.
          </p>
        )}
        {lookupError && (
          <p role="alert" className="mt-4 text-center text-wine">
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      {guest && (
        <div className="mt-4">
          <CheckinCard key={guest.token} guest={guest} onNext={scanNext} onAdmitted={refreshCounts} />
        </div>
      )}
    </div>
  );
}
