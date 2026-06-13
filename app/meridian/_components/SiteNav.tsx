"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
  { label: "Customers", href: "#customers" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "padding 0.5s var(--m-ease)",
        paddingBlock: scrolled ? "0.7rem" : "1.25rem",
      }}
    >
      <nav
        className="m-container"
        aria-label="Primary"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
            paddingInline: scrolled ? "1.1rem" : "0",
            paddingBlock: scrolled ? "0.55rem" : "0",
            borderRadius: 999,
            transition: "all 0.5s var(--m-ease)",
            background: scrolled ? "rgba(245, 243, 238, 0.72)" : "transparent",
            backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
            boxShadow: scrolled ? "0 1px 0 var(--m-line), 0 18px 40px -30px rgba(20,19,14,0.5)" : "none",
            flex: "1 1 auto",
          }}
        >
          <a href="#top" aria-label="Meridian home" style={{ display: "flex" }}>
            <Wordmark />
          </a>
          <ul
            className="m-nav-links"
            style={{ display: "flex", gap: "1.9rem", listStyle: "none", margin: 0, padding: 0 }}
          >
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="m-link"
                  style={{ fontSize: "0.92rem", color: "var(--m-ink-2)" }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "1.25rem" }}>
          <a
            href="#"
            className="m-nav-signin m-link"
            style={{ fontSize: "0.92rem", color: "var(--m-ink-2)" }}
          >
            Sign in
          </a>
          <a
            href="#start"
            className="m-btn m-btn-primary"
            style={{ height: "2.7rem", paddingInline: "1.25rem", fontSize: "0.9rem" }}
          >
            Start free
          </a>
        </div>
      </nav>
    </header>
  );
}
