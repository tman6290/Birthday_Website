import { Suspense } from "react";
import type { Metadata } from "next";
import { DoorScanner } from "@/components/door-scanner";
import { StaffLogin } from "@/components/staff-login";
import { counts } from "@/lib/guests";
import { isStaff } from "@/lib/session";

export const metadata: Metadata = { title: "Check-in · Funsho at 50" };

async function Door() {
  if (!(await isStaff())) return <StaffLogin title="Check-in" />;
  const c = await counts();
  return <DoorScanner initialCounts={{ admitted: c.admitted, attending: c.attending }} />;
}

export default function DoorPage() {
  return (
    <div className="min-h-dvh bg-ivory">
      <Suspense fallback={null}>
        <Door />
      </Suspense>
    </div>
  );
}
