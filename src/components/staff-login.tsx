"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId } from "react";
import { signIn } from "@/app/staff-actions";
import { btnPrimary } from "./respond-buttons";

const inputClass =
  "mt-2 block w-full rounded-[2px] border-0 border-b border-gold bg-transparent px-0.5 py-2.5 text-lg text-ink focus:border-wine focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine";

export function StaffLogin({ title }: { title: string }) {
  const router = useRouter();
  const id = useId();
  const [state, action, pending] = useActionState(signIn, {});

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-12">
      <h1 className="font-serif text-4xl text-ink">{title}</h1>
      <form action={action} className="mt-8 flex flex-col gap-6">
        <div>
          <label htmlFor={`${id}-user`} className="label block">
            Username
          </label>
          <input
            id={`${id}-user`}
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            autoFocus
            defaultValue={state.username}
            key={state.username}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${id}-pass`} className="label block">
            Password
          </label>
          <input
            id={`${id}-pass`}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={!!state.error}
            aria-describedby={state.error ? `${id}-error` : undefined}
            className={inputClass}
          />
          {state.error && (
            <p id={`${id}-error`} className="mt-1.5 text-sm text-wine">
              {state.error}
            </p>
          )}
        </div>
        <button type="submit" className={btnPrimary} disabled={pending}>
          Sign in
        </button>
      </form>
    </main>
  );
}
