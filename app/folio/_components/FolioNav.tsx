"use client";

import { useEffect, useState } from "react";
import { RESUME } from "../_data/resume";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Approach", href: "#approach" },
  { label: "Writing", href: "#writing" },
];

export function FolioNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        inset: "0 0 auto 0",
        zIndex: 50,
        paddingBlock: scrolled ? "0.65rem" : "1.25rem",
        background: scrolled ? "rgba(230,230,224,0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid var(--f-line)" : "1px solid transparent",
        transition: "all 0.5s var(--f-ease)",
      }}
    >
      <nav
        className="f-container"
        aria-label="Primary"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <a href="#top" style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", textDecoration: "none", color: "var(--f-ink)" }}>
          <span style={{ fontFamily: "var(--f-display)", fontWeight: 620, fontSize: "1.18rem", letterSpacing: "-0.02em" }}>
            {RESUME.name}
          </span>
          <span className="f-coord" style={{ color: "var(--f-faint)" }}>52.52°N</span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
          <ul className="f-nav-links" style={{ display: "flex", gap: "1.6rem", listStyle: "none", margin: 0, padding: 0 }}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="f-link f-coord" style={{ fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contact" className="f-btn f-btn-primary" style={{ height: "2.6rem", paddingInline: "1.1rem", fontSize: "0.72rem" }}>
            Start a project
          </a>
        </div>
      </nav>
    </header>
  );
}
