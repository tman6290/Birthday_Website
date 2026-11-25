export const event = {
  celebrant: "Funsho",
  theme: "Royal Heritage",
  /** No new acceptances once this many guests are attending. */
  capacity: 400,
  /** WhatsApp reminders go out from this date (Lagos time) until the day before the event. */
  reminderDate: "2026-12-25",
  eventDate: "2026-12-30",
  dateLabel: "Wednesday, 30 December 2026",
  programme: [
    { kicker: "An intimate hour of", title: "Hymns, Praise & Thanksgiving", time: "12:00 noon – 1:00 pm" },
    { kicker: null, title: "Reception", time: "2:00 pm – 8:00 pm" },
  ],
  venue: {
    name: "Brava Event Center",
    address: "Plot 8, Guinness Road, Off Akilo Road, Ikeja",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brava+Event+Center+Guinness+Road+Ikeja+Lagos",
  },
  dressCode: {
    ladies: "Elegant dresses in shades of green or champagne gold, complemented with emerald green fascinators.",
    gentlemen: "English suits or distinguished native attire.",
  },
  contacts: [
    { name: "Bukola", phone: "+2348035117901", display: "+234 803 511 7901" },
    { name: "Blay", phone: "+2348167470038", display: "+234 816 747 0038" },
  ],
} as const;
