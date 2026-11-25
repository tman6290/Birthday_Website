import { Suspense } from "react";
import { connection } from "next/server";
import { event } from "@/config/event";
import { EnvelopeIntro } from "@/components/envelope-intro";
import { Crown, FleurDeLis, Flourish } from "@/components/ornaments";
import { RespondButtons } from "@/components/respond-buttons";
import { RsvpProvider } from "@/components/rsvp-context";
import { RsvpSheet } from "@/components/rsvp-sheet";
import { isFull } from "@/lib/guests";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="label">{children}</h2>;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="silk min-h-dvh" />}>
      <Gate />
    </Suspense>
  );
}

async function Gate() {
  await connection();
  let full = false;
  try {
    full = await isFull();
  } catch (err) {
    // If the count can't be read, show the invitation; the RSVP route still enforces the limit.
    console.error("Capacity check failed", err);
  }
  return full ? <EventFull /> : <Invitation />;
}

function EventFull() {
  return (
    <div className="silk flex min-h-dvh flex-col">
      <main className="mx-auto flex max-w-[560px] flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <Crown className="w-11 text-gold" />
        <p className="foil mt-6 font-serif text-[5rem] font-medium leading-none">Nº 50</p>
        <p className="mt-1 font-script text-4xl text-ink">Celebrating</p>
        <h1 className="foil py-2 font-script text-7xl leading-[1.15]">{event.celebrant}</h1>
        <Flourish className="mx-auto w-56 text-gold" />
        <p className="mt-8 font-serif text-3xl italic text-ink">This event is full</p>
        <ul className="mt-8 flex flex-col gap-2 text-base">
          {event.contacts.map((c) => (
            <li key={c.phone}>
              <a href={`tel:${c.phone}`} className="inline-block py-1 text-ink hover:text-wine">
                {c.name} · <span className="tabular-nums">{c.display}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col text-center text-[0.72rem] font-medium uppercase tracking-[0.3em] sm:flex-row sm:text-sm">
      <p className="bg-wine px-4 py-4 text-ivory sm:flex-1 sm:text-right">Strictly by invitation</p>
      <p className="bg-gold px-4 py-4 text-ink sm:flex-1 sm:text-left">Adults only</p>
    </footer>
  );
}

function Invitation() {
  return (
    <RsvpProvider>
      <EnvelopeIntro />
      <div id="page" className="silk min-h-dvh">
        <main id="main" tabIndex={-1} className="mx-auto max-w-[560px] px-5 pb-16 pt-14 outline-none sm:pt-20">
          <header className="text-center">
            <Crown className="mx-auto w-11 text-gold" />
            <p className="foil mt-6 font-serif text-[6.5rem] font-medium leading-none sm:text-[8rem]">
              Nº 50
            </p>
            <p className="mt-1 font-script text-5xl text-ink">Celebrating</p>
            <Flourish className="mx-auto mt-5 w-56 text-gold" />
            <h1 className="foil py-2 font-script text-[5.5rem] leading-[1.15] sm:text-8xl">{event.celebrant}</h1>
            <Flourish className="mx-auto w-56 text-gold" />
            <p className="label mt-8">Theme</p>
            <p className="mt-2 font-serif text-3xl font-medium uppercase tracking-[0.12em] text-wine">
              {event.theme}
            </p>
          </header>

          <section className="mt-20 text-center" aria-labelledby="day">
            <SectionLabel>
              <span id="day">The day</span>
            </SectionLabel>
            <p className="mt-4 font-serif text-[1.65rem] leading-tight text-ink sm:text-3xl">{event.dateLabel}</p>
            <ul className="mx-auto mt-8 flex max-w-sm flex-col gap-7 text-left">
              {event.programme.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <FleurDeLis className="mt-1 w-7 shrink-0 text-wine" />
                  <div>
                    {item.kicker && <p className="text-sm uppercase tracking-[0.12em] text-wine">{item.kicker}</p>}
                    <p className="font-serif text-2xl font-medium uppercase leading-tight tracking-[0.04em] text-wine">
                      {item.title}
                    </p>
                    <p className="mt-1 font-serif text-xl text-ink">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-20" aria-labelledby="venue">
            <div className="rounded-[14px] border border-gold/60 bg-sand/70 px-6 py-8 text-center">
              <SectionLabel>
                <span id="venue">The venue</span>
              </SectionLabel>
              <p className="mt-4 font-serif text-3xl font-medium text-ink">{event.venue.name}</p>
              <p className="mt-2 text-base leading-relaxed text-ink/85">{event.venue.address}</p>
              <a
                href={event.venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block py-1 text-sm uppercase tracking-[0.2em] text-wine underline decoration-gold underline-offset-[6px]"
              >
                Open in Maps
              </a>
            </div>
          </section>

          <section className="mt-20 text-center" aria-labelledby="dress">
            <SectionLabel>
              <span id="dress">Dress code</span>
            </SectionLabel>
            <dl className="mt-6 flex flex-col gap-6">
              <div>
                <dt className="label text-gold-deep">Ladies</dt>
                <dd className="mt-2 font-serif text-xl leading-snug text-ink">{event.dressCode.ladies}</dd>
              </div>
              <div>
                <dt className="label text-gold-deep">Gentlemen</dt>
                <dd className="mt-2 font-serif text-xl leading-snug text-ink">{event.dressCode.gentlemen}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-20 text-center" aria-labelledby="respond">
            <Flourish className="mx-auto w-56 text-gold" />
            <h2 id="respond" className="mt-6 font-serif text-4xl italic text-ink">
              Kindly respond
            </h2>
            <div className="mx-auto mt-8 max-w-xs">
              <RespondButtons />
            </div>
            <ul className="mt-10 flex flex-col gap-2 text-base">
              {event.contacts.map((c) => (
                <li key={c.phone}>
                  <a href={`tel:${c.phone}`} className="inline-block py-1 text-ink hover:text-wine">
                    {c.name} · <span className="tabular-nums">{c.display}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <Footer />
      </div>
      <RsvpSheet />
    </RsvpProvider>
  );
}
