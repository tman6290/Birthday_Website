"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { event } from "@/config/event";
import { Flourish, WaxSeal } from "./ornaments";
import { RespondButtons } from "./respond-buttons";

type Phase = "closed" | "opening" | "card";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function EnvelopeIntro() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>("closed");
  const sealRef = useRef<HTMLButtonElement>(null);
  const cardHeadingRef = useRef<HTMLParagraphElement>(null);

  const shownPhase: Phase = reduce ? "card" : phase;

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  useEffect(() => {
    if (shownPhase === "closed") sealRef.current?.focus({ preventScroll: true });
    if (shownPhase === "card") cardHeadingRef.current?.focus({ preventScroll: true });
  }, [shownPhase]);

  const opening = shownPhase === "opening";

  const close = (focusMain: boolean) => {
    setVisible(false);
    if (focusMain) {
      requestAnimationFrame(() => document.getElementById("main")?.focus());
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          role="dialog"
          aria-modal="true"
          aria-label="Invitation"
          className="silk fixed inset-0 z-40 overflow-y-auto bg-ivory"
          exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.4 } }}
        >
          {shownPhase !== "card" && (
            <button
              type="button"
              onClick={() => setPhase("card")}
              className="absolute right-3 top-3 z-10 px-3 py-2 text-[0.72rem] uppercase tracking-[0.3em] text-wine underline-offset-4 hover:underline"
            >
              Skip
            </button>
          )}

          <div className="flex min-h-full items-center justify-center px-4 py-12">
            {shownPhase !== "card" ? (
              <div className="flex w-full flex-col items-center">
                <motion.div
                  className="relative aspect-[1.45/1] w-[min(86vw,400px)]"
                  style={{ perspective: 1200 }}
                  animate={opening ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
                  transition={{ delay: opening ? 1.3 : 0, duration: 0.5, ease }}
                  onAnimationComplete={() => {
                    if (opening) setPhase("card");
                  }}
                >
                  <div className="absolute inset-0 rounded-[3px] border border-gold/70 bg-champagne" />

                  <motion.div
                    className="double-rule absolute inset-x-[7%] top-[6%] bottom-[8%] z-[1] flex items-start justify-center bg-ivory pt-[7%]"
                    animate={opening ? { y: "-62%" } : { y: 0 }}
                    transition={{ delay: 0.75, duration: 0.6, ease }}
                  >
                    <span className="foil font-script text-4xl leading-none">{event.celebrant}</span>
                  </motion.div>

                  <svg
                    viewBox="0 0 145 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    className="absolute inset-0 z-[2] h-full w-full"
                  >
                    <path d="M0 0 72.5 56 145 0V100H0Z" fill="#F3E7CF" />
                    <path d="M0 100 72.5 50 145 100" fill="#EFE1C4" />
                    <path
                      d="M0 0 72.5 56 145 0M0 100 72.5 50 145 100"
                      fill="none"
                      stroke="#C9A24D"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  <motion.div
                    className="absolute inset-x-0 top-0 h-[58%] origin-top"
                    initial={false}
                    animate={opening ? { rotateX: 180, zIndex: 0 } : { rotateX: 0, zIndex: 3 }}
                    transition={{
                      rotateX: { delay: 0.25, duration: 0.55, ease },
                      zIndex: { delay: 0.5, duration: 0 },
                    }}
                  >
                    <svg viewBox="0 0 145 58" preserveAspectRatio="none" aria-hidden="true" className="h-full w-full">
                      <path d="M0 0H145L72.5 58Z" fill="#F6ECD8" />
                      <path
                        d="M0 0 72.5 58 145 0"
                        fill="none"
                        stroke="#C9A24D"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </motion.div>

                  <button
                    ref={sealRef}
                    type="button"
                    onClick={() => setPhase("opening")}
                    disabled={opening}
                    aria-label="Open the invitation"
                    className="absolute left-1/2 top-[58%] z-[4] size-[23%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  >
                    <span className={`relative block size-full ${opening ? "" : "seal-pulse"}`}>
                      <motion.span
                        className="absolute inset-0"
                        style={{ clipPath: "inset(0 50% 0 0)" }}
                        animate={opening ? { x: -18, rotate: -14, opacity: 0 } : { x: 0, rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease }}
                      >
                        <WaxSeal className="size-full" />
                      </motion.span>
                      <motion.span
                        className="absolute inset-0"
                        style={{ clipPath: "inset(0 0 0 50%)" }}
                        animate={opening ? { x: 18, rotate: 14, opacity: 0 } : { x: 0, rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease }}
                      >
                        <WaxSeal className="size-full" />
                      </motion.span>
                    </span>
                  </button>
                </motion.div>

                <motion.p
                  className="mt-10 text-[0.72rem] uppercase tracking-[0.3em] text-wine"
                  animate={{ opacity: opening ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Tap the seal
                </motion.p>
              </div>
            ) : (
              <motion.div
                className="double-rule w-full max-w-[420px] bg-champagne px-7 py-10 text-center sm:px-10"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reduce ? 0.4 : 0.5, ease }}
              >
                <p
                  ref={cardHeadingRef}
                  tabIndex={-1}
                  className="text-[0.72rem] uppercase tracking-[0.3em] text-wine outline-none"
                >
                  You are invited to celebrate
                </p>
                <p className="foil mt-4 py-1 font-script text-7xl leading-[1.15]">{event.celebrant}</p>
                <p className="font-serif text-2xl italic text-gold-deep">at fifty</p>
                <Flourish className="mx-auto mt-5 w-44 text-gold" />
                <p className="mt-5 font-serif text-lg leading-snug text-ink">
                  <span className="whitespace-nowrap">{event.dateLabel}</span> ·{" "}
                  <span className="whitespace-nowrap">{event.venue.name}, Ikeja</span>
                </p>
                <div className="mt-8">
                  <RespondButtons onChoose={() => close(false)} />
                </div>
                <button
                  type="button"
                  onClick={() => close(true)}
                  className="mt-6 px-2 py-1 text-sm text-gold-deep underline decoration-gold/60 underline-offset-4 hover:text-wine"
                >
                  Read the details first
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
