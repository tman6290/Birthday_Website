import { event } from "@/config/event";
import { FleurDeLis } from "./ornaments";

export function PassCard({ token, fullName }: { token: string; fullName: string }) {
  const qr = `/api/pass/${token}/qr`;
  return (
    <div className="double-rule mx-auto w-full max-w-[400px] bg-champagne px-6 py-8 text-center">
      <p className="label">Entry pass</p>
      <p className="mt-3 font-serif text-3xl font-medium leading-tight text-ink">{fullName}</p>
      <div className="mx-auto mt-6 w-[220px] border border-gold bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt={`Entry pass QR code for ${fullName}`} width={204} height={204} className="block size-[204px]" />
      </div>
      <p className="mt-6 font-serif text-xl text-ink">{event.dateLabel}</p>
      <ul className="mt-3 flex flex-col gap-2.5 text-sm text-ink/90">
        {event.programme.map((item) => (
          <li key={item.title}>
            <span className="inline-flex items-center gap-1.5 text-wine">
              <FleurDeLis className="w-3 shrink-0" />
              {item.title}
            </span>
            <span className="block">{item.time}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm leading-relaxed text-ink/90">
        {event.venue.name}, {event.venue.address}
      </p>
      <a
        href={`${qr}?download`}
        download
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-[4px] bg-wine px-6 py-3 text-[0.8rem] font-medium uppercase tracking-[0.2em] text-ivory hover:bg-[#6a2327]"
      >
        Save pass
      </a>
    </div>
  );
}
