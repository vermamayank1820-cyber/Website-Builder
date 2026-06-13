import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./folio.css";

/** Characterful grotesk display face. Geist + Geist Mono come from the root
 *  layout as inherited CSS variables. */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Priya Raman — Design Engineer & Creative Technologist",
  description:
    "I work at the seam where design becomes code — interfaces, design systems, and generative work that teams can actually ship.",
};

export default function FolioLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${bricolage.variable} folio`}>{children}</div>;
}
