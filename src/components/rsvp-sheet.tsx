"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { acceptSchema, arrivalOptions, declineSchema } from "@/lib/rsvp-schema";
import { PassCard } from "./pass-card";
import { btnPrimary } from "./respond-buttons";
import { useRsvp, type SheetKind } from "./rsvp-context";

const GENERIC_ERROR = "Something went wrong. Please try again.";

type Errors = Record<string, string | undefined>;

export function RsvpSheet() {
  const { sheet, closeSheet } = useRsvp();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sheet) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    const page = document.getElementById("page");
    document.body.style.overflow = "hidden";
    if (page) page.inert = true;
    requestAnimationFrame(() => titleRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSheet();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, [tabindex="0"]',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      if (page) page.inert = false;
      const el = returnFocus.current;
      if (el && document.contains(el)) el.focus();
      else document.getElementById("main")?.focus();
    };
  }, [sheet, closeSheet]);

  return (
    <AnimatePresence>
      {sheet && (
        <motion.div
          key="sheet"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.25 }}
        >
          <div className="absolute inset-0 bg-ink/45" onClick={closeSheet} aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className="relative max-h-[92dvh] w-full overflow-y-auto border-t border-gold bg-ivory px-6 pb-10 pt-6 sm:max-w-[480px] sm:border sm:px-9 sm:pt-8"
            initial={reduce ? { opacity: 0 } : { y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 80, opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeSheet}
                className="-mr-2 px-2 py-1 text-[0.72rem] uppercase tracking-[0.3em] text-wine hover:underline"
              >
                Close
              </button>
            </div>
            <SheetBody kind={sheet} titleRef={titleRef} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SheetBody({ kind, titleRef }: { kind: SheetKind; titleRef: React.RefObject<HTMLHeadingElement | null> }) {
  return kind === "accept" ? <AcceptForm titleRef={titleRef} /> : <DeclineForm titleRef={titleRef} />;
}

function Title({ children, titleRef }: { children: ReactNode; titleRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <h2 id="sheet-title" ref={titleRef} tabIndex={-1} className="font-serif text-4xl italic text-ink outline-none">
      {children}
    </h2>
  );
}

function Field({
  label,
  error,
  children,
  id,
}: {
  label: string;
  error?: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label block">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-wine">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "mt-2 block w-full rounded-[2px] border-0 border-b border-gold bg-transparent px-0.5 py-2.5 text-lg text-ink focus:border-wine focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine aria-[invalid=true]:border-wine";

async function postOnce(body: unknown) {
  const res = await fetch("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data } as { status: number; data: Record<string, unknown> };
}

const transient = (status: number) => status === 408 || status >= 500;

/** Accepting is keyed on email, so retrying a transient failure is safe. Declines are sent once. */
async function postRsvp(body: { response: "accept" | "decline" }) {
  const delays = body.response === "accept" ? [1500, 4000] : [];
  for (let attempt = 0; ; attempt++) {
    try {
      const result = await postOnce(body);
      if (!transient(result.status) || attempt >= delays.length) return result;
    } catch (err) {
      if (attempt >= delays.length) throw err;
    }
    await new Promise((r) => setTimeout(r, delays[attempt]));
  }
}

function collectErrors(issues: { path: PropertyKey[]; message: string }[]): Errors {
  const errors: Errors = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

function AcceptForm({ titleRef }: { titleRef: React.RefObject<HTMLHeadingElement | null> }) {
  const uid = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{
    firstName: string;
    token: string | null;
    fullName: string;
    emailSent: boolean;
  } | null>(
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (done) titleRef.current?.focus();
  }, [done, titleRef]);

  const focusFirstError = (errs: Errors) => {
    const order = ["fullName", "email", "phone", "arrival"];
    const first = order.find((k) => errs[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      response: "accept" as const,
      fullName: String(fd.get("fullName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      arrival: String(fd.get("arrival") ?? ""),
    };
    const parsed = acceptSchema.safeParse(body);
    if (!parsed.success) {
      const errs = collectErrors(parsed.error.issues);
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const { status, data } = await postRsvp(body);
      if (data.ok) {
        setDone({
          firstName: String(data.firstName),
          token: typeof data.token === "string" ? data.token : null,
          fullName: parsed.data.fullName,
          emailSent: Boolean(data.emailSent),
        });
      } else if (status === 400 && data.errors && Object.keys(data.errors).length) {
        const errs = data.errors as Errors;
        setErrors(errs);
        focusFirstError(errs);
      } else {
        setErrors({ form: GENERIC_ERROR });
      }
    } catch {
      setErrors({ form: GENERIC_ERROR });
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div>
        <Title titleRef={titleRef}>See you on the 30th, {done.firstName}.</Title>
        <p className="mt-3 text-base leading-relaxed text-ink/85">
          {!done.token
            ? "Your pass is in your inbox. Please show it at the entrance."
            : done.emailSent
              ? "Your pass is below and in your inbox. Please show it at the entrance."
              : "Your pass is below. Please save it and show it at the entrance."}
        </p>
        {done.token && (
          <div className="mt-7">
            <PassCard token={done.token} fullName={done.fullName} />
          </div>
        )}
      </div>
    );
  }

  const describe = (name: string) => (errors[name] ? `${uid}-${name}-error` : undefined);

  return (
    <div>
      <Title titleRef={titleRef}>Your details</Title>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-6">
        <Field label="Full name" id={`${uid}-fullName`} error={errors.fullName}>
          <input
            id={`${uid}-fullName`}
            name="fullName"
            autoComplete="name"
            className={inputClass}
            aria-invalid={!!errors.fullName}
            aria-describedby={describe("fullName")}
          />
        </Field>
        <Field label="Email" id={`${uid}-email`} error={errors.email}>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={inputClass}
            aria-invalid={!!errors.email}
            aria-describedby={describe("email")}
          />
        </Field>
        <Field label="Phone number" id={`${uid}-phone`} error={errors.phone}>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={inputClass}
            aria-invalid={!!errors.phone}
            aria-describedby={describe("phone")}
          />
        </Field>
        <Field label="How will you arrive?" id={`${uid}-arrival`} error={errors.arrival}>
          <select
            id={`${uid}-arrival`}
            name="arrival"
            defaultValue=""
            className={`${inputClass} cursor-pointer`}
            aria-invalid={!!errors.arrival}
            aria-describedby={describe("arrival")}
          >
            <option value="" disabled></option>
            {arrivalOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        {errors.form && (
          <p role="alert" className="text-sm text-wine">
            {errors.form}
          </p>
        )}

        <button type="submit" className={`${btnPrimary} mt-2`} disabled={sending}>
          {sending ? "Sending…" : "Confirm attendance"}
        </button>
      </form>
    </div>
  );
}

function DeclineForm({ titleRef }: { titleRef: React.RefObject<HTMLHeadingElement | null> }) {
  const uid = useId();
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    if (firstName) titleRef.current?.focus();
  }, [firstName, titleRef]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = { response: "decline" as const, fullName: String(fd.get("fullName") ?? "") };
    const parsed = declineSchema.safeParse(body);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      e.currentTarget.querySelector<HTMLInputElement>('[name="fullName"]')?.focus();
      return;
    }
    setError(undefined);
    setFormError(undefined);
    setSending(true);
    try {
      const { data } = await postRsvp(body);
      if (data.ok) setFirstName(String(data.firstName));
      else setFormError(GENERIC_ERROR);
    } catch {
      setFormError(GENERIC_ERROR);
    } finally {
      setSending(false);
    }
  }

  if (firstName) {
    return (
      <Title titleRef={titleRef}>
        Thank you, {firstName}. We&apos;ve let the family know.
      </Title>
    );
  }

  const id = `${uid}-fullName`;
  return (
    <div>
      <Title titleRef={titleRef}>We&apos;ll miss you</Title>
      <form onSubmit={onSubmit} noValidate className="mt-7 flex flex-col gap-6">
        <Field label="Full name" id={id} error={error}>
          <input
            id={id}
            name="fullName"
            autoComplete="name"
            className={inputClass}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </Field>
        {formError && (
          <p role="alert" className="text-sm text-wine">
            {formError}
          </p>
        )}
        <button type="submit" className={`${btnPrimary} mt-2`} disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
