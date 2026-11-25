import { Suspense } from "react";
import type { Metadata } from "next";
import { PassCard } from "@/components/pass-card";
import { findByToken } from "@/lib/guests";

export const metadata: Metadata = {
  title: "Entry pass · Funsho at 50",
};

async function Pass({ params }: { params: PageProps<"/p/[token]">["params"] }) {
  const { token } = await params;
  const guest = await findByToken(token);

  if (!guest || guest.response !== "attending") {
    return <p className="py-24 text-center font-serif text-2xl text-ink">This pass isn&apos;t recognised.</p>;
  }

  return <PassCard token={guest.token} fullName={guest.full_name} />;
}

export default function PassPage({ params }: PageProps<"/p/[token]">) {
  return (
    <main className="silk flex min-h-dvh items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <Pass params={params} />
      </Suspense>
    </main>
  );
}
