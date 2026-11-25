"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "@/app/staff-actions";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut();
          router.refresh();
        })
      }
      className="min-h-11 whitespace-nowrap px-2 text-[0.72rem] font-medium uppercase tracking-[0.3em] text-wine underline-offset-4 hover:underline disabled:opacity-60 print:hidden"
    >
      Sign out
    </button>
  );
}
