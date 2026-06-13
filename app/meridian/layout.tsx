import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./meridian.css";

/**
 * Display serif for the editorial layer. Geist + Geist Mono are already
 * provided as CSS variables by the root layout and inherited here, so we
 * only need to add the display face.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian — Release intelligence for engineering teams",
  description:
    "Meridian turns every deploy into a calm, legible narrative: what shipped, what changed, what's at risk. The release layer for teams that ship with taste.",
};

export default function MeridianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${fraunces.variable} meridian`}>{children}</div>;
}
