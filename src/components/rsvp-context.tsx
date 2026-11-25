"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type SheetKind = "accept" | "decline";

type Ctx = {
  sheet: SheetKind | null;
  openSheet: (kind: SheetKind) => void;
  closeSheet: () => void;
};

const RsvpContext = createContext<Ctx | null>(null);

export function RsvpProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  return (
    <RsvpContext.Provider value={{ sheet, openSheet: setSheet, closeSheet: () => setSheet(null) }}>
      {children}
    </RsvpContext.Provider>
  );
}

export function useRsvp() {
  const ctx = useContext(RsvpContext);
  if (!ctx) throw new Error("useRsvp outside RsvpProvider");
  return ctx;
}
