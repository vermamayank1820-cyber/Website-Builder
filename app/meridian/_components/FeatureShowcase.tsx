import { Reveal } from "./Reveal";
import { CheckMark } from "./icons";
import type { ReactNode } from "react";

interface Feature {
  eyebrow: string;
  title: ReactNode;
  body: string;
  points: string[];
  visual: ReactNode;
  reversed?: boolean;
}

/* ── Mini panel: change narrative ──────────────────────────── */

const COMMITS = [
  { initials: "JS", color: "#2b2be6", msg: "Harden payment retry path", tag: "payments" },
  { initials: "AO", color: "#1f7a4d", msg: "Cache search shards on boot", tag: "search-index" },
  { initials: "RK", color: "#b4690e", msg: "Add billing migration 0042", tag: "billing-worker" },
];

function ChangeNarrative() {
  return (
    <div className="m-panel" role="img" aria-label="Change narrative: three commits grouped by service with authors">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: "var(--m-mono)", fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--m-faint)" }}>
          What changed · 4.20 → 4.21
        </span>
        <span className="m-chip" style={{ borderColor: "var(--m-line-2)" }}>18 commits</span>
      </div>
      {COMMITS.map((c) => (
        <div key={c.initials} className="m-commit">
          <span className="m-avatar" style={{ background: c.color }}>{c.initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.86rem", color: "var(--m-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {c.msg}
            </div>
            <div style={{ fontFamily: "var(--m-mono)", fontSize: "0.68rem", color: "var(--m-muted)" }}>{c.tag}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Mini panel: dependency graph ──────────────────────────── */

function DependencyGraph() {
  return (
    <div className="m-panel" role="img" aria-label="Dependency graph showing a deploy rippling across four connected services">
      <div style={{ fontFamily: "var(--m-mono)", fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--m-faint)", marginBottom: "0.75rem" }}>
        Blast radius
      </div>
      <svg viewBox="0 0 320 200" style={{ width: "100%", height: "auto" }} aria-hidden="true">
        <g stroke="var(--m-line-3)" strokeWidth="1.4" fill="none">
          <path d="M60 100 L160 50" />
          <path d="M60 100 L160 150" />
          <path d="M160 50 L260 70" />
          <path d="M160 150 L260 130" />
          <path d="M160 50 L160 150" stroke="var(--m-accent-line)" strokeDasharray="4 4" />
        </g>
        {[
          { x: 60, y: 100, c: "var(--m-accent)", label: "gateway" },
          { x: 160, y: 50, c: "var(--m-ok)", label: "search" },
          { x: 160, y: 150, c: "var(--m-warn)", label: "payments" },
          { x: 260, y: 70, c: "var(--m-ok)", label: "ledger" },
          { x: 260, y: 130, c: "var(--m-risk)", label: "billing" },
        ].map((n) => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r="9" fill="#fff" stroke={n.c} strokeWidth="2.4" />
            <circle cx={n.x} cy={n.y} r="3.5" fill={n.c} />
            <text x={n.x} y={n.y + 24} textAnchor="middle" fontSize="9" fill="var(--m-muted)" fontFamily="var(--m-mono)">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Mini panel: rollback ──────────────────────────────────── */

function RollbackPanel() {
  return (
    <div className="m-panel" role="img" aria-label="Rollback control showing a single click to restore the previous release">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--m-mono)", fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--m-faint)" }}>
          Recovery
        </span>
        <span className="m-chip" style={{ borderColor: "var(--m-accent-line)", color: "var(--m-accent)" }}>
          <span className="m-chip-dot" style={{ background: "var(--m-accent)" }} />
          armed
        </span>
      </div>
      <div style={{ fontFamily: "var(--m-display)", fontSize: "1.3rem", marginTop: "0.85rem", letterSpacing: "-0.01em" }}>
        Roll back to 4.20
      </div>
      <div style={{ fontSize: "0.82rem", color: "var(--m-muted)", marginTop: "0.2rem" }}>
        Restores billing-worker in ~12s. Traffic drained automatically.
      </div>
      <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.1rem" }}>
        <span className="m-btn m-btn-primary" style={{ height: "2.6rem", paddingInline: "1.2rem", fontSize: "0.85rem" }}>
          Confirm rollback
        </span>
        <span className="m-btn m-btn-ghost" style={{ height: "2.6rem", paddingInline: "1.2rem", fontSize: "0.85rem" }}>
          Hold
        </span>
      </div>
    </div>
  );
}

const FEATURES: Feature[] = [
  {
    eyebrow: "Visibility",
    title: <>See what a deploy <span className="m-italic">actually</span> touches.</>,
    body: "Meridian reads your dependency graph and shows the real blast radius of every release — not the diff, the consequence.",
    points: ["Service-level risk scoring", "Schema & migration drift detection", "Live as the deploy rolls"],
    visual: <DependencyGraph />,
  },
  {
    eyebrow: "Narrative",
    title: <>Every release, explained in <span className="m-italic">plain language</span>.</>,
    body: "Eighteen commits become one legible story, grouped by service and author. The kind of summary you'd actually paste into the channel.",
    points: ["Auto-grouped by surface", "Author & ownership context", "Shareable release notes"],
    visual: <ChangeNarrative />,
    reversed: true,
  },
  {
    eyebrow: "Recovery",
    title: <>Calm is a <span className="m-italic">rollback</span> away.</>,
    body: "When a signal trips, Meridian arms a one-click rollback and drains traffic for you. No frantic runbook, no guesswork.",
    points: ["Pre-armed on every deploy", "Automatic traffic draining", "Under 15 seconds to safe"],
    visual: <RollbackPanel />,
  },
];

export function FeatureShowcase() {
  return (
    <section id="product" className="m-section" style={{ paddingTop: "var(--m-section)" }}>
      <div className="m-container">
        <div style={{ maxWidth: "44rem", marginBottom: "1rem" }}>
          <Reveal>
            <span className="m-eyebrow">The product</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="m-h2" style={{ marginTop: "1.4rem" }}>
              Built for the moment after you hit deploy.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="m-lead" style={{ marginTop: "1.5rem", maxWidth: "46ch" }}>
              Three views, one job: keep shipping fast without flying blind.
            </p>
          </Reveal>
        </div>

        {FEATURES.map((feature, i) => (
          <div key={feature.eyebrow} className={`m-feature-row ${feature.reversed ? "is-reversed" : ""}`}>
            <div className="m-feature-copy">
              <Reveal>
                <span className="m-eyebrow">{feature.eyebrow}</span>
              </Reveal>
              <Reveal delay={80}>
                <h3 className="m-h3" style={{ marginTop: "1.2rem", maxWidth: "18ch" }}>
                  {feature.title}
                </h3>
              </Reveal>
              <Reveal delay={140}>
                <p style={{ marginTop: "1.1rem", color: "var(--m-ink-2)", maxWidth: "42ch", lineHeight: 1.55 }}>
                  {feature.body}
                </p>
              </Reveal>
              <Reveal delay={200}>
                <ul className="m-feature-list">
                  {feature.points.map((point) => (
                    <li key={point}>
                      <CheckMark />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={i === 0 ? 0 : 120}>{feature.visual}</Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
