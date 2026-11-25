import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Pinyon_Script } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const script = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
});

const sans = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Funsho at 50 · Royal Heritage",
  description: "Wednesday 30 December 2026 · Brava Event Center, Ikeja",
  openGraph: {
    title: "Funsho at 50 · Royal Heritage",
    description: "Wednesday 30 December 2026 · Brava Event Center, Ikeja",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Funsho at 50 invitation" }],
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#FBF6EC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${script.variable} ${sans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
