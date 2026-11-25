import { Suspense } from "react";
import type { Metadata } from "next";
import { PrintButton } from "@/components/print-button";
import { StaffLogin } from "@/components/staff-login";
import { formatDate, formatTime } from "@/lib/format";
import { allGuests } from "@/lib/guests";
import { arrivalLabel, formatPhone } from "@/lib/rsvp-schema";
import { isHost } from "@/lib/session";

export const metadata: Metadata = { title: "Guest list · Funsho at 50" };

const th = "border-b border-gold px-3 py-2 text-left text-[0.68rem] font-medium uppercase tracking-[0.2em] text-wine";
const td = "border-b border-sand px-3 py-2.5 align-top";

async function GuestList() {
  if (!(await isHost())) return <StaffLogin title="Guest list" />;

  const guests = await allGuests();
  const attending = guests.filter((g) => g.response === "attending");
  const declined = guests.filter((g) => g.response === "declined");
  const cars = attending.filter((g) => g.needs_parking).length;

  const figures = [
    { label: "Attending", value: attending.length },
    { label: "Cars to park", value: cars },
    { label: "Declined", value: declined.length },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 print:max-w-none print:p-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl text-ink">Guest list</h1>
        <PrintButton />
      </div>

      <dl className="mt-6 grid grid-cols-3 border-y border-gold">
        {figures.map((f) => (
          <div key={f.label} className="px-2 py-4 text-center">
            <dt className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-wine">{f.label}</dt>
            <dd className="mt-1 font-serif text-4xl tabular-nums text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 overflow-x-auto print:overflow-visible">
        <table className="w-full min-w-[560px] border-collapse text-sm text-ink print:min-w-0 print:text-[10pt]">
          <thead>
            <tr>
              <th className={`${th} hidden w-8 print:table-cell`} aria-label="Tick" />
              <th className={th}>Name</th>
              <th className={th}>Phone</th>
              <th className={th}>Arrival</th>
              <th className={th}>Parking</th>
              <th className={th}>Arrived</th>
            </tr>
          </thead>
          <tbody>
            {attending.map((g) => (
              <tr key={g.id} className="break-inside-avoid">
                <td className={`${td} hidden print:table-cell`}>
                  <span className="inline-block size-3.5 border border-ink" />
                </td>
                <td className={`${td} font-medium`}>{g.full_name}</td>
                <td className={`${td} whitespace-nowrap tabular-nums`}>{formatPhone(g.phone)}</td>
                <td className={td}>{arrivalLabel(g.arrival)}</td>
                <td className={td}>{g.needs_parking ? "Yes" : ""}</td>
                <td className={`${td} whitespace-nowrap`}>{formatTime(g.checked_in_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {declined.length > 0 && (
        <section className="mt-12 break-before-auto" aria-labelledby="declined">
          <h2 id="declined" className="font-serif text-2xl text-ink">
            Declined
          </h2>
          <table className="mt-3 w-full max-w-lg border-collapse text-sm text-ink print:text-[10pt]">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Date responded</th>
              </tr>
            </thead>
            <tbody>
              {declined.map((g) => (
                <tr key={g.id} className="break-inside-avoid">
                  <td className={td}>{g.full_name}</td>
                  <td className={`${td} whitespace-nowrap`}>{formatDate(g.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-dvh bg-ivory print:bg-white">
      <Suspense fallback={null}>
        <GuestList />
      </Suspense>
    </div>
  );
}
