import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export function FleurDeLis(props: P) {
  return (
    <svg viewBox="0 0 40 48" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M20 1c-5.5 6.5-6.6 15.4-2.6 25.5h5.2C26.6 16.4 25.5 7.5 20 1Z" />
      <path d="M17.2 26.2c-4.6.5-9.6-.8-12-4.6-2.6-4.1-.6-9.4 3.6-9.4 3 0 4.6 2.6 3.4 4.8-.7-1.6-2.3-2.2-3.6-1.4-1.8 1.1-1.3 4 1.2 5.5 2.1 1.3 4.9 1.6 7.4 1.4Z" />
      <path d="M22.8 26.2c4.6.5 9.6-.8 12-4.6 2.6-4.1.6-9.4-3.6-9.4-3 0-4.6 2.6-3.4 4.8.7-1.6 2.3-2.2 3.6-1.4 1.8 1.1 1.3 4-1.2 5.5-2.1 1.3-4.9 1.6-7.4 1.4Z" />
      <rect x="11" y="27" width="18" height="3.4" rx="1.2" />
      <path d="M18 31.2c-.6 5.6-4 9.3-9 10.6 3.8 1.8 8.4.4 10.2-3.2V31.2Z" />
      <path d="M22 31.2c.6 5.6 4 9.3 9 10.6-3.8 1.8-8.4.4-10.2-3.2V31.2Z" />
      <path d="M18.6 31.2h2.8v9.2L20 47l-1.4-6.6Z" />
    </svg>
  );
}

export function Flourish(props: P) {
  return (
    <svg viewBox="0 0 240 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="0.9" {...props}>
      <path d="M0 9h92M148 9h92" />
      <path d="M120 3.5l4.2 5.5-4.2 5.5-4.2-5.5Z" fill="currentColor" stroke="none" />
      <path d="M114 9c-3-5-11-6.2-14.4-2-2.3 2.9-.3 6.4 2.8 6 2.5-.3 3-3.3 1-4.2" />
      <path d="M126 9c3-5 11-6.2 14.4-2 2.3 2.9.3 6.4-2.8 6-2.5-.3-3-3.3-1-4.2" />
      <path d="M100 9c-2.6 0-5 .9-8 0M140 9c2.6 0 5 .9 8 0" />
      <circle cx="109.5" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="130.5" cy="4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Crown(props: P) {
  return (
    <svg viewBox="0 0 48 34" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" {...props}>
      <path d="M7 25 4.5 9.5l9.5 8L24 5l10 12.5 9.5-8L41 25Z" />
      <path d="M7 29.5h34" />
      <path d="M7 25h34" />
      <circle cx="4.5" cy="8" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="24" cy="3.2" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="43.5" cy="8" r="1.8" fill="currentColor" stroke="none" />
      <path d="M24 13.5l2.2 3-2.2 3-2.2-3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function sealEdge() {
  const pts: string[] = [];
  const n = 72;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 47 + Math.sin(i * 1.7) * 1.6 + Math.cos(i * 0.9) * 1.2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

const SEAL_EDGE = sealEdge();

export function WaxSeal(props: P) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      <path d={SEAL_EDGE} fill="#7B2A2E" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#5E1E22" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#9A4146" strokeWidth="0.8" />
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#E8CD8F"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 40, fontWeight: 500 }}
      >
        F
      </text>
    </svg>
  );
}
