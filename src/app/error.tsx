"use client";

import { useEffect } from "react";
import { btnPrimary } from "@/components/respond-buttons";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="silk flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <p className="font-serif text-2xl text-ink">Something went wrong. Please try again.</p>
      <div className="mt-8 w-full max-w-xs">
        <button type="button" onClick={() => retry()} className={btnPrimary}>
          Try again
        </button>
      </div>
    </main>
  );
}
